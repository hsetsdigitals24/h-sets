"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TaskStatus, SprintStatus, ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSection, requireRole } from "@/lib/auth";
import type { ContentActionState } from "@/lib/content-forms";

/**
 * Server actions for the admin project-management tool.
 *
 * Everything is gated by requireSection("projects"). Board reordering uses a
 * fractional `order` column: the client computes the midpoint between the two
 * neighbours a task is dropped between, so a move is a single-row update.
 */

const TASK_STATUSES = Object.values(TaskStatus) as [TaskStatus, ...TaskStatus[]];
const SPRINT_STATUSES = Object.values(SprintStatus) as [
  SprintStatus,
  ...SprintStatus[],
];
// Literal tuple (not derived from the runtime enum) so this module never depends
// on the `ProjectStatus` value export being present at load time.
const PROJECT_STATUSES = [
  "ACTIVE",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
] as const satisfies readonly ProjectStatus[];

function revalidateProject(id: string) {
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
}

/**
 * Keep a sprint's status in sync with its tasks. A sprint auto-completes once it
 * has tasks and every one of them is DONE; if a previously-completed sprint
 * gains unfinished work again (a task reopened, moved in, or added) it drops
 * back to ACTIVE. Sprints with no tasks are left untouched — there's nothing to
 * infer — as are manual PLANNED/ACTIVE choices while work is still in progress.
 * Pass every sprint a mutation touched (both sides of a move).
 */
async function syncSprintStatus(sprintId: string | null | undefined) {
  if (!sprintId) return;
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    select: { status: true, _count: { select: { tasks: true } } },
  });
  if (!sprint || sprint._count.tasks === 0) return;

  const unfinished = await prisma.task.count({
    where: { sprintId, status: { not: "DONE" } },
  });
  const allDone = unfinished === 0;

  if (allDone && sprint.status !== "COMPLETED") {
    await prisma.sprint.update({
      where: { id: sprintId },
      data: { status: "COMPLETED" },
    });
  } else if (!allDone && sprint.status === "COMPLETED") {
    await prisma.sprint.update({
      where: { id: sprintId },
      data: { status: "ACTIVE" },
    });
  }
}

/**
 * Keep a project's status in sync with its work. A project auto-completes once it
 * has work (at least one task or sprint) and everything is finished — every task
 * DONE and every sprint COMPLETED; if a completed project gains unfinished work
 * again it drops back to IN_PROGRESS. Projects with no work are left untouched,
 * as are ARCHIVED projects (archiving is a deliberate, terminal choice we never
 * override). Call this AFTER syncSprintStatus so sprint statuses are current.
 */
async function syncProjectStatus(projectId: string | null | undefined) {
  if (!projectId) return;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      status: true,
      _count: { select: { tasks: true, sprints: true } },
    },
  });
  if (!project || project.status === "ARCHIVED") return;
  if (project._count.tasks === 0 && project._count.sprints === 0) return;

  const [unfinishedTasks, openSprints] = await Promise.all([
    prisma.task.count({ where: { projectId, status: { not: "DONE" } } }),
    prisma.sprint.count({
      where: { projectId, status: { not: "COMPLETED" } },
    }),
  ]);
  const allDone = unfinishedTasks === 0 && openSprints === 0;

  if (allDone && project.status !== "COMPLETED") {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "COMPLETED" },
    });
  } else if (!allDone && project.status === "COMPLETED") {
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "IN_PROGRESS" },
    });
  }
}

// ---------------------------------------------------------------- projects ---
//
// Only SUPER_ADMIN may create, rename, or delete a project. Other admin roles
// still collaborate inside a project (tasks, epics, sprints, members, comments)
// via requireSection("projects").

const projectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required"),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
});

export async function createProject(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireRole("SUPER_ADMIN");
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status ?? "ACTIVE",
      createdById: user.id,
      // The creator is automatically an owner member.
      members: { create: { userId: user.id, role: "OWNER" } },
    },
  });
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${project.id}`);
}

export async function updateProject(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireRole("SUPER_ADMIN");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const parsed = projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  await prisma.project.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
    },
  });
  revalidateProject(id);
  return { ok: true };
}

export async function deleteProject(formData: FormData) {
  await requireRole("SUPER_ADMIN");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

// ----------------------------------------------------------------- members ---

export async function addMember(formData: FormData) {
  await requireSection("projects");
  const projectId = formData.get("projectId");
  const userId = formData.get("userId");
  if (typeof projectId !== "string" || typeof userId !== "string") {
    return { error: "Missing fields." };
  }
  // Never let a student be added to an internal admin project.
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role === "STUDENT") return { error: "Invalid member." };

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId } },
    create: { projectId, userId, role: "MEMBER" },
    update: {},
  });
  revalidateProject(projectId);
}

export async function removeMember(formData: FormData) {
  await requireSection("projects");
  const projectId = formData.get("projectId");
  const userId = formData.get("userId");
  if (typeof projectId !== "string" || typeof userId !== "string") {
    return { error: "Missing fields." };
  }
  await prisma.projectMember
    .delete({ where: { projectId_userId: { projectId, userId } } })
    .catch(() => {});
  revalidateProject(projectId);
}

// ------------------------------------------------------------------- tasks ---

const taskSchema = z.object({
  title: z.string().trim().min(2, "Task title is required"),
  description: z.string().trim().max(5000).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  assigneeId: z.string().optional(),
  // A task belongs to a sprint (the lowest level of the hierarchy). Its epic is
  // derived from that sprint, so it is not set directly on the task.
  sprintId: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function createTask(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("projects");
  const projectId = formData.get("projectId");
  if (typeof projectId !== "string") return { error: "Missing project." };

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || undefined,
    assigneeId: formData.get("assigneeId") || undefined,
    sprintId: formData.get("sprintId") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const status = parsed.data.status ?? "TODO";

  // Append to the bottom of its column.
  const last = await prisma.task.findFirst({
    where: { projectId, status },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.task.create({
    data: {
      projectId,
      title: parsed.data.title,
      description: parsed.data.description,
      status,
      assigneeId: parsed.data.assigneeId || null,
      sprintId: parsed.data.sprintId || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      order: (last?.order ?? 0) + 1,
    },
  });
  await syncSprintStatus(parsed.data.sprintId || null);
  await syncProjectStatus(projectId);
  revalidateProject(projectId);
  return { ok: true };
}

export async function updateTask(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("projects");
  const id = formData.get("id");
  const projectId = formData.get("projectId");
  if (typeof id !== "string" || typeof projectId !== "string") {
    return { error: "Missing fields." };
  }
  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || undefined,
    assigneeId: formData.get("assigneeId") || undefined,
    sprintId: formData.get("sprintId") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  // Remember the sprint the task was in before this edit: if it moved sprints,
  // both the source and destination sprints may need their status recomputed.
  const before = await prisma.task.findUnique({
    where: { id },
    select: { sprintId: true },
  });
  const newSprintId = parsed.data.sprintId || null;
  await prisma.task.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      assigneeId: parsed.data.assigneeId || null,
      sprintId: newSprintId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });
  await syncSprintStatus(newSprintId);
  if (before?.sprintId && before.sprintId !== newSprintId) {
    await syncSprintStatus(before.sprintId);
  }
  await syncProjectStatus(projectId);
  revalidateProject(projectId);
  return { ok: true };
}

/**
 * Move a task on the board (drag-and-drop). The client passes the target
 * column and a fractional `order` (midpoint of the drop neighbours).
 */
export async function moveTask(formData: FormData) {
  await requireSection("projects");
  const id = formData.get("id");
  const projectId = formData.get("projectId");
  const status = formData.get("status");
  const order = Number(formData.get("order"));
  if (
    typeof id !== "string" ||
    typeof projectId !== "string" ||
    typeof status !== "string" ||
    !TASK_STATUSES.includes(status as TaskStatus) ||
    !Number.isFinite(order)
  ) {
    return { error: "Invalid move." };
  }
  const moved = await prisma.task.update({
    where: { id },
    data: { status: status as TaskStatus, order },
    select: { sprintId: true },
  });
  await syncSprintStatus(moved.sprintId);
  await syncProjectStatus(projectId);
  revalidateProject(projectId);
}

export async function deleteTask(formData: FormData) {
  await requireSection("projects");
  const id = formData.get("id");
  const projectId = formData.get("projectId");
  if (typeof id !== "string" || typeof projectId !== "string") {
    return { error: "Missing fields." };
  }
  // Capture the sprint before deleting: removing the last unfinished task can
  // tip its sprint into COMPLETED.
  const before = await prisma.task.findUnique({
    where: { id },
    select: { sprintId: true },
  });
  await prisma.task.delete({ where: { id } });
  await syncSprintStatus(before?.sprintId);
  await syncProjectStatus(projectId);
  revalidateProject(projectId);
}

// ---------------------------------------------------------------- comments ---

export async function addComment(formData: FormData) {
  const user = await requireSection("projects");
  const taskId = formData.get("taskId");
  const projectId = formData.get("projectId");
  const body = formData.get("body");
  if (typeof taskId !== "string" || typeof projectId !== "string") {
    return { error: "Missing fields." };
  }
  const text = String(body ?? "").trim().slice(0, 5000);
  if (!text) return { error: "Comment can't be empty." };

  await prisma.taskComment.create({
    data: { taskId, authorId: user.id, body: text },
  });
  revalidateProject(projectId);
}

// ------------------------------------------------------------------- epics ---

const HEX = /^#[0-9a-fA-F]{6}$/;

const epicSchema = z.object({
  title: z.string().trim().min(2, "Epic title is required").max(120),
  description: z.string().trim().max(2000).optional(),
  color: z.string().regex(HEX, "Pick a colour").optional(),
});

export async function createEpic(formData: FormData) {
  await requireSection("projects");
  const projectId = formData.get("projectId");
  if (typeof projectId !== "string") return { error: "Missing project." };
  const parsed = epicSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const last = await prisma.epic.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  await prisma.epic.create({
    data: {
      projectId,
      title: parsed.data.title,
      description: parsed.data.description,
      color: parsed.data.color ?? undefined,
      order: (last?.order ?? 0) + 1,
    },
  });
  revalidateProject(projectId);
}

export async function updateEpic(formData: FormData) {
  await requireSection("projects");
  const id = formData.get("id");
  const projectId = formData.get("projectId");
  if (typeof id !== "string" || typeof projectId !== "string") {
    return { error: "Missing fields." };
  }
  const parsed = epicSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    color: formData.get("color") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  await prisma.epic.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      color: parsed.data.color ?? undefined,
    },
  });
  revalidateProject(projectId);
}

export async function deleteEpic(formData: FormData) {
  await requireSection("projects");
  const id = formData.get("id");
  const projectId = formData.get("projectId");
  if (typeof id !== "string" || typeof projectId !== "string") {
    return { error: "Missing fields." };
  }
  // Child sprints are detached (epicId → null) automatically via onDelete:
  // SetNull; their tasks are unaffected.
  await prisma.epic.delete({ where: { id } });
  revalidateProject(projectId);
}

// ----------------------------------------------------------------- sprints ---

const sprintSchema = z.object({
  name: z.string().trim().min(2, "Sprint name is required").max(120),
  goal: z.string().trim().max(2000).optional(),
  status: z.enum(SPRINT_STATUSES).optional(),
  // Parent epic (a sprint lives under an epic). Optional — an unparented sprint
  // is allowed.
  epicId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function createSprint(formData: FormData) {
  await requireSection("projects");
  const projectId = formData.get("projectId");
  if (typeof projectId !== "string") return { error: "Missing project." };
  const parsed = sprintSchema.safeParse({
    name: formData.get("name"),
    goal: formData.get("goal") || undefined,
    status: formData.get("status") || undefined,
    epicId: formData.get("epicId") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const last = await prisma.sprint.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  await prisma.sprint.create({
    data: {
      projectId,
      name: parsed.data.name,
      goal: parsed.data.goal,
      status: parsed.data.status ?? "PLANNED",
      epicId: parsed.data.epicId || null,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      order: (last?.order ?? 0) + 1,
    },
  });
  // A new (unfinished) sprint can reopen a previously-completed project.
  await syncProjectStatus(projectId);
  revalidateProject(projectId);
}

export async function updateSprint(formData: FormData) {
  await requireSection("projects");
  const id = formData.get("id");
  const projectId = formData.get("projectId");
  if (typeof id !== "string" || typeof projectId !== "string") {
    return { error: "Missing fields." };
  }
  const parsed = sprintSchema.safeParse({
    name: formData.get("name"),
    goal: formData.get("goal") || undefined,
    status: formData.get("status") || undefined,
    epicId: formData.get("epicId") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  await prisma.sprint.update({
    where: { id },
    data: {
      name: parsed.data.name,
      goal: parsed.data.goal ?? null,
      status: parsed.data.status,
      epicId: parsed.data.epicId || null,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });
  // Manually completing/reopening a sprint can tip the whole project over.
  await syncProjectStatus(projectId);
  revalidateProject(projectId);
}

export async function deleteSprint(formData: FormData) {
  await requireSection("projects");
  const id = formData.get("id");
  const projectId = formData.get("projectId");
  if (typeof id !== "string" || typeof projectId !== "string") {
    return { error: "Missing fields." };
  }
  // Tasks are detached (sprintId → null) automatically via onDelete: SetNull.
  await prisma.sprint.delete({ where: { id } });
  // Removing an unfinished sprint can complete the project.
  await syncProjectStatus(projectId);
  revalidateProject(projectId);
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { finalizeInFlightRecordings } from "@/lib/livekit";
import { PageHeading } from "@/components/admin/page-heading";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { RecordingsList } from "@/components/lms/recordings-list";
import { Board } from "./board";
import { MeetingButton } from "./meeting-button";
import { EditProjectDialog } from "./edit-project-dialog";
import { PROJECT_STATUS_META } from "../project-status";
import { deleteProject } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireSection("projects");
  const isSuperAdmin = user.role === "SUPER_ADMIN";
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { addedAt: "asc" },
      },
      epics: { orderBy: { order: "asc" }, include: { _count: { select: { sprints: true } } } },
      sprints: {
        orderBy: { order: "asc" },
        include: {
          epic: { select: { id: true, title: true, color: true } },
          _count: { select: { tasks: true } },
        },
      },
      tasks: {
        orderBy: { order: "asc" },
        include: {
          assignee: { select: { id: true, name: true } },
          sprint: {
            select: {
              id: true,
              name: true,
              epic: { select: { id: true, title: true, color: true } },
            },
          },
          comments: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { name: true } } },
          },
          _count: { select: { comments: true } },
        },
      },
    },
  });
  if (!project) notFound();

  // Fall back to ACTIVE for any unexpected/missing status so the header never
  // crashes on a status that isn't in the metadata map.
  const status = PROJECT_STATUS_META[project.status] ? project.status : "ACTIVE";
  const statusMeta = PROJECT_STATUS_META[status];

  // Non-student accounts that can be added as members / assignees.
  const admins = await prisma.user.findMany({
    where: { role: { not: "STUDENT" } },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  // Recordings of this project's meetings. Same finalisation path as class
  // recordings — the egress webhook flips rows to READY. Any project member can
  // play/download; only the OWNER or a super admin can delete (mirrors the
  // DELETE endpoint's canRecordProject rule).
  //
  // Self-heal first: if the LiveKit webhook never reached us, a stopped
  // recording can be stuck in PROCESSING. Reconcile in-flight rows against
  // LiveKit here so they finalise (READY with file metadata, or FAILED) on view.
  await finalizeInFlightRecordings({ projectId: project.id });
  const recordings = await prisma.recording.findMany({
    where: { projectId: project.id },
    orderBy: { startedAt: "desc" },
    select: { id: true, status: true, durationSec: true, sizeBytes: true, startedAt: true },
  });
  const canManageRecordings =
    isSuperAdmin ||
    project.members.some((m) => m.user.id === user.id && m.role === "OWNER");

  // Epic → Sprint → Task: an epic's task count is the sum of its sprints' tasks.
  const epicTaskCount = new Map<string, number>();
  for (const s of project.sprints) {
    if (s.epicId) {
      epicTaskCount.set(
        s.epicId,
        (epicTaskCount.get(s.epicId) ?? 0) + s._count.tasks
      );
    }
  }

  return (
    <div>
      <PageHeading
        back={{ href: "/admin/projects", label: "Back to projects" }}
        title={project.name}
        description={project.description ?? undefined}
        action={
          <div className="flex items-center gap-2">
            <Badge variant={statusMeta.badge}>{statusMeta.label}</Badge>
            <MeetingButton projectId={project.id} />
            {isSuperAdmin && (
              <>
                <EditProjectDialog
                  project={{
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    status,
                  }}
                />
                <DeleteButton
                  id={project.id}
                  action={deleteProject}
                  label="Delete project"
                  confirmText="Delete this project and all its tasks? This cannot be undone."
                />
              </>
            )}
          </div>
        }
      />

      <Board
        projectId={project.id}
        currentUserId={user.id}
        tasks={project.tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          order: t.order,
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          assigneeId: t.assigneeId,
          assigneeName: t.assignee?.name ?? null,
          // Epic is derived from the task's sprint (Epic → Sprint → Task).
          epicId: t.sprint?.epic?.id ?? null,
          epicTitle: t.sprint?.epic?.title ?? null,
          epicColor: t.sprint?.epic?.color ?? null,
          sprintId: t.sprintId,
          sprintName: t.sprint?.name ?? null,
          commentCount: t._count.comments,
          comments: t.comments.map((c) => ({
            id: c.id,
            body: c.body,
            authorName: c.author.name,
            createdAt: c.createdAt.toISOString(),
          })),
        }))}
        members={project.members.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          role: m.user.role,
        }))}
        admins={admins}
        epics={project.epics.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          color: e.color,
          sprintCount: e._count.sprints,
          taskCount: epicTaskCount.get(e.id) ?? 0,
        }))}
        sprints={project.sprints.map((s) => ({
          id: s.id,
          name: s.name,
          goal: s.goal,
          status: s.status,
          epicId: s.epicId,
          epicTitle: s.epic?.title ?? null,
          epicColor: s.epic?.color ?? null,
          startDate: s.startDate ? s.startDate.toISOString() : null,
          endDate: s.endDate ? s.endDate.toISOString() : null,
          taskCount: s._count.tasks,
        }))}
      />

      <section className="mt-10">
        <h2 className="mb-2 text-sm font-semibold text-foreground">
          Meeting recordings
        </h2>
        <div className="rounded-2xl border border-border bg-card shadow-soft">
          <RecordingsList recordings={recordings} canManage={canManageRecordings} />
        </div>
      </section>
    </div>
  );
}

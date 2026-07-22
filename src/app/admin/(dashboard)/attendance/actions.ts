"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { canManageCohort } from "@/lib/cohort-access";
import type { ContentActionState } from "@/lib/content-forms";

const NOT_ASSIGNED = "You are not assigned to this cohort.";

const sessionSchema = z.object({
  cohortId: z.string().min(1, "Pick a cohort"),
  title: z.string().min(2, "Session title is required"),
  scheduledAt: z.string().min(1, "Pick a date/time"),
});

export async function createSession(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("attendance");
  const parsed = sessionSchema.safeParse({
    cohortId: formData.get("cohortId"),
    title: formData.get("title"),
    scheduledAt: formData.get("scheduledAt"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (!(await canManageCohort(user, parsed.data.cohortId))) return { error: NOT_ASSIGNED };
  const when = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(when.getTime())) return { error: "Invalid date/time." };

  await prisma.classSession.create({
    data: { cohortId: parsed.data.cohortId, title: parsed.data.title, scheduledAt: when },
  });
  revalidatePath("/admin/attendance");
  return { ok: true };
}

export async function deleteSession(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireSection("attendance");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const owner = await prisma.classSession.findUnique({ where: { id }, select: { cohortId: true } });
  if (!owner) return { error: "Session not found." };
  if (!(await canManageCohort(user, owner.cohortId))) return { error: NOT_ASSIGNED };
  await prisma.classSession.delete({ where: { id } });
  revalidatePath("/admin/attendance");
}

/** Mark a single student present or absent for a session (upsert). */
export async function setAttendance(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireSection("attendance");
  const sessionId = formData.get("sessionId");
  const studentId = formData.get("studentId");
  const present = formData.get("present") === "true";
  if (typeof sessionId !== "string" || typeof studentId !== "string") return { error: "Missing data." };

  const session = await prisma.classSession.findUnique({ where: { id: sessionId }, select: { cohortId: true } });
  if (!session) return { error: "Session not found." };
  if (!(await canManageCohort(user, session.cohortId))) return { error: NOT_ASSIGNED };

  await prisma.attendance.upsert({
    where: { sessionId_studentId: { sessionId, studentId } },
    create: { sessionId, studentId, present },
    update: { present, markedAt: new Date() },
  });
  revalidatePath(`/admin/attendance/${sessionId}`);
  revalidatePath(`/account/learn/${session.cohortId}`);
}

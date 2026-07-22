"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import { getActiveEnrollment } from "@/lib/lms";
import { buildKey, presignUpload } from "@/lib/storage";
import type { ContentActionState } from "@/lib/content-forms";
import type { PresignResult } from "@/components/lms/file-upload";

/** Students sign out back to the public login page. */
export async function signOutStudent() {
  await signOut({ redirectTo: "/login" });
}

/** Verify the current student is actively enrolled in the cohort a lesson belongs to. */
async function assertLessonAccess(studentId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { cohortId: true } } },
  });
  if (!lesson) return null;
  const enrollment = await getActiveEnrollment(studentId, lesson.module.cohortId);
  return enrollment ? lesson.module.cohortId : null;
}

export async function markLessonComplete(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireRole("STUDENT");
  const lessonId = formData.get("lessonId");
  if (typeof lessonId !== "string") return { error: "Missing lesson." };
  const cohortId = await assertLessonAccess(user.id, lessonId);
  if (!cohortId) return { error: "You are not enrolled in this lesson's cohort." };

  await prisma.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId: user.id, lessonId } },
    create: { studentId: user.id, lessonId },
    update: {},
  });
  revalidatePath(`/account/learn/${cohortId}`);
  revalidatePath("/account");
}

export async function unmarkLessonComplete(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireRole("STUDENT");
  const lessonId = formData.get("lessonId");
  if (typeof lessonId !== "string") return { error: "Missing lesson." };
  const cohortId = await assertLessonAccess(user.id, lessonId);
  if (!cohortId) return { error: "Not allowed." };

  await prisma.lessonProgress
    .delete({ where: { studentId_lessonId: { studentId: user.id, lessonId } } })
    .catch(() => {});
  revalidatePath(`/account/learn/${cohortId}`);
  revalidatePath("/account");
}

/** Presigned upload URL for an assignment submission file. */
export async function requestSubmissionUpload(
  filename: string,
  contentType: string
): Promise<PresignResult> {
  await requireRole("STUDENT");
  try {
    const key = buildKey("submissions", filename);
    const url = await presignUpload(key, contentType);
    return { url, key };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not start upload." };
  }
}

export async function submitAssignment(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireRole("STUDENT");
  const assignmentId = formData.get("assignmentId");
  if (typeof assignmentId !== "string") return { error: "Missing assignment." };

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) return { error: "Assignment not found." };

  const enrollment = await getActiveEnrollment(user.id, assignment.cohortId);
  if (!enrollment) return { error: "You are not enrolled in this cohort." };

  if (assignment.dueDate.getTime() < Date.now()) {
    // Block new submissions after the deadline; existing ones are handled below.
    const existing = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId: user.id } },
    });
    if (!existing) return { error: "The deadline for this assignment has passed." };
  }

  const text = (formData.get("text") as string)?.trim() || null;
  const r2Key = (formData.get("r2Key") as string)?.trim() || null;
  const fileName = (formData.get("fileName") as string)?.trim() || null;
  if (!text && !r2Key) return { error: "Add a written response, a link, or upload a file." };

  await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId: user.id } },
    create: { assignmentId, studentId: user.id, text, r2Key, fileName, status: "submitted" },
    update: { text, r2Key, fileName, status: "submitted", submittedAt: new Date(), score: null, feedback: null, gradedAt: null },
  });
  revalidatePath(`/account/assignments/${assignmentId}`);
  revalidatePath("/account/assignments");
  revalidatePath("/account");
  return { ok: true };
}

/** Student confirms attendance for a live session (within admin's window). */
export async function confirmAttendance(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireRole("STUDENT");
  const sessionId = formData.get("sessionId");
  if (typeof sessionId !== "string") return { error: "Missing session." };

  const session = await prisma.classSession.findUnique({ where: { id: sessionId } });
  if (!session) return { error: "Session not found." };
  const enrollment = await getActiveEnrollment(user.id, session.cohortId);
  if (!enrollment) return { error: "You are not enrolled in this cohort." };

  try {
    await prisma.attendance.create({
      data: { sessionId, studentId: user.id, present: true },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return; // already confirmed — no-op
    }
    throw e;
  }
  revalidatePath(`/account/learn/${session.cohortId}`);
  revalidatePath("/account");
}

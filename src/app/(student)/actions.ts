"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
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

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    password: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Students change their own password (e.g. the default one an admin issued when
 * adding them to a cohort). Requires the current password to prevent a hijacked
 * session from locking the owner out.
 */
export async function changePassword(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const sessionUser = await requireRole("STUDENT");
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { passwordHash: true },
  });
  if (!user) return { error: "Account not found." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Your current password is incorrect." };

  if (await bcrypt.compare(parsed.data.password, user.passwordHash)) {
    return { error: "Your new password must be different from your current one." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({ where: { id: sessionUser.id }, data: { passwordHash } });

  return { ok: true };
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

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { canManageCohort } from "@/lib/cohort-access";
import { notifyNewLead } from "@/lib/email";
import { createNotification } from "@/lib/notifications";
import { deleteObject } from "@/lib/storage";
import type { ContentActionState } from "@/lib/content-forms";

const NOT_ASSIGNED = "You are not assigned to this cohort.";

// --- Assignments ---------------------------------------------------------

const assignmentSchema = z.object({
  cohortId: z.string().min(1, "Pick a cohort"),
  title: z.string().min(2, "Title is required"),
  description: z.string().min(1, "Add a description"),
  dueDate: z.string().min(1, "Pick a due date"),
  maxScore: z.coerce.number().int().min(1).max(1000),
});

export async function createAssignment(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("grading");
  const parsed = assignmentSchema.safeParse({
    cohortId: formData.get("cohortId"),
    title: formData.get("title"),
    description: formData.get("description"),
    dueDate: formData.get("dueDate"),
    maxScore: formData.get("maxScore"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (!(await canManageCohort(user, parsed.data.cohortId))) return { error: NOT_ASSIGNED };

  const due = new Date(parsed.data.dueDate);
  if (Number.isNaN(due.getTime())) return { error: "Invalid due date." };

  await prisma.assignment.create({
    data: {
      cohortId: parsed.data.cohortId,
      title: parsed.data.title,
      description: parsed.data.description,
      dueDate: due,
      maxScore: parsed.data.maxScore,
    },
  });
  revalidatePath("/admin/grading");
  return { ok: true };
}

export async function deleteAssignment(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireSection("grading");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const owner = await prisma.assignment.findUnique({ where: { id }, select: { cohortId: true } });
  if (!owner) return { error: "Assignment not found." };
  if (!(await canManageCohort(user, owner.cohortId))) return { error: NOT_ASSIGNED };
  const assignment = await prisma.assignment.delete({
    where: { id },
    include: { submissions: { select: { r2Key: true } } },
  });
  await Promise.all(assignment.submissions.map((s) => (s.r2Key ? deleteObject(s.r2Key) : null)));
  revalidatePath("/admin/grading");
}

// --- Grading -------------------------------------------------------------

const gradeSchema = z.object({
  submissionId: z.string().min(1),
  score: z.coerce.number().int().min(0),
  feedback: z.string().optional(),
});

export async function gradeSubmission(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("grading");
  const parsed = gradeSchema.safeParse({
    submissionId: formData.get("submissionId"),
    score: formData.get("score"),
    feedback: formData.get("feedback"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const submission = await prisma.submission.findUnique({
    where: { id: parsed.data.submissionId },
    include: {
      assignment: { select: { title: true, maxScore: true, cohortId: true } },
      student: { select: { name: true, email: true } },
    },
  });
  if (!submission) return { error: "Submission not found." };
  if (!(await canManageCohort(user, submission.assignment.cohortId))) return { error: NOT_ASSIGNED };

  const feedback = parsed.data.feedback?.trim() || null;
  if (parsed.data.score > submission.assignment.maxScore) {
    return { error: `Score can't exceed ${submission.assignment.maxScore}.` };
  }
  // PRD §9.3: feedback required when marking below 60.
  if (parsed.data.score < 60 && !feedback) {
    return { error: "Feedback is required when scoring below 60." };
  }

  await prisma.submission.update({
    where: { id: parsed.data.submissionId },
    data: { score: parsed.data.score, feedback, status: "graded", gradedAt: new Date() },
  });

  // Notify the student their grade is released.
  await notifyNewLead({
    type: "grade",
    subject: `Your grade for "${submission.assignment.title}"`,
    fields: {
      assignment: submission.assignment.title,
      score: `${parsed.data.score}/${submission.assignment.maxScore}`,
    },
    userEmail: submission.student.email,
    userName: submission.student.name,
    confirmation: {
      subject: `Your grade is ready — ${submission.assignment.title}`,
      body: `<p>Your submission for <strong>${submission.assignment.title}</strong> has been graded: <strong>${parsed.data.score}/${submission.assignment.maxScore}</strong>.</p>${
        feedback ? `<p>Feedback: ${feedback}</p>` : ""
      }<p>Sign in to your student portal to see the details.</p>`,
    },
  });

  await createNotification(submission.studentId, {
    type: "grade",
    title: `Grade released — ${submission.assignment.title}`,
    body: `You scored ${parsed.data.score}/${submission.assignment.maxScore}.`,
    link: "/account/assignments",
  });

  revalidatePath(`/admin/grading/${submission.assignmentId}`);
  return { ok: true };
}

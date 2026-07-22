"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getActiveEnrollment, gradeExamAttempt, finalizeExpiredAttempt } from "@/lib/lms";
import {
  studentExamPhase,
  examAttemptContext,
  isAttemptExpired,
  effectiveWindowEnd,
  selectServedQuestionIds,
  buildOptionOrders,
  violationLimitReached,
} from "@/lib/exams";
import { formatDateTime } from "@/lib/utils";

export type StartResult = { attemptId?: string; error?: string };

/**
 * Creates a fresh in-progress attempt for the current student, enforcing that
 * the exam is scheduled, the window is open, and attempts remain.
 */
export async function startExamAttempt(examId: string): Promise<StartResult> {
  const user = await requireRole("STUDENT");

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { orderBy: { order: "asc" }, select: { id: true, type: true, options: true } } },
  });
  if (!exam) return { error: "Exam not found." };
  if (exam.status !== "scheduled") return { error: "This exam isn't available." };

  const enrollment = await getActiveEnrollment(user.id, exam.cohortId);
  if (!enrollment) return { error: "You are not enrolled in this cohort." };

  const grant = await prisma.examRetakeGrant.findUnique({
    where: { examId_studentId: { examId, studentId: user.id } },
    select: { extraAttempts: true, startAtOverride: true, endAtOverride: true },
  });
  const extraAttempts = grant?.extraAttempts ?? 0;
  // The window end that applies to this student — the admin override if set.
  const effectiveEnd = effectiveWindowEnd(exam.endAt, grant);

  // The window must be open regardless of whether we resume or start fresh.
  const readAvailability = async () => {
    const attempts = await prisma.examAttempt.findMany({
      where: { examId, studentId: user.id },
      select: { status: true, submittedAt: true, score: true },
    });
    const ctx = examAttemptContext(attempts, extraAttempts, grant);
    return { ctx, availability: studentExamPhase(exam, ctx) };
  };

  let { ctx, availability } = await readAvailability();
  if (availability.phase === "upcoming") return { error: "This exam hasn't opened yet." };
  if (availability.phase === "closed" && availability.reason === "window") {
    return { error: "This exam is closed." };
  }

  // Resume a still-live in-progress attempt — cooldown, attempt limits, and the
  // passed rule only gate *starting a new* attempt. An in-progress attempt that
  // has run past its deadline is auto-closed here so a retake can reopen fresh.
  const existing = await prisma.examAttempt.findFirst({
    where: { examId, studentId: user.id, status: "in_progress" },
    select: { id: true, status: true, startedAt: true },
  });
  if (existing) {
    if (!isAttemptExpired(existing.startedAt, exam.durationMins, effectiveEnd)) {
      return { attemptId: existing.id };
    }
    await finalizeExpiredAttempt({
      id: existing.id,
      status: existing.status,
      startedAt: existing.startedAt,
      exam: { ...exam, endAt: effectiveEnd },
    });
    // Re-derive against the freshly submitted attempt (cooldown / attempts / passed).
    ({ ctx, availability } = await readAvailability());
  }

  if (availability.phase === "closed") {
    return availability.reason === "passed"
      ? { error: "You've already passed this exam." }
      : { error: "You've used all your attempts for this exam." };
  }
  if (availability.phase === "cooldown") {
    return {
      error: `You can retake this exam after ${
        availability.readyAt ? formatDateTime(availability.readyAt.toISOString()) : "the cooldown period"
      }.`,
    };
  }

  // Freeze the paper this attempt will see: subset selection + option order,
  // seeded by the (yet-to-exist) attempt id. We create first to get the id, then
  // fill the integrity fields so a reload always re-derives the identical paper.
  const attempt = await prisma.examAttempt.create({
    data: { examId, studentId: user.id, attemptNo: ctx.attemptsUsed + 1 },
  });
  const questions = exam.questions.map((q) => ({
    id: q.id,
    type: q.type,
    options: (q.options as { id: string }[]) ?? [],
  }));
  const servedQuestionIds = selectServedQuestionIds(questions, {
    shuffle: exam.shuffle,
    count: exam.questionsToServe,
    seed: attempt.id,
  });
  const optionOrders = exam.shuffleOptions
    ? buildOptionOrders(questions, servedQuestionIds, attempt.id)
    : {};
  await prisma.examAttempt.update({
    where: { id: attempt.id },
    data: { servedQuestionIds, optionOrders },
  });
  return { attemptId: attempt.id };
}

/** Record the student's acceptance of the exam's integrity attestation. */
export async function recordAttestation(
  attemptId: string
): Promise<{ ok?: boolean; error?: string }> {
  const user = await requireRole("STUDENT");
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    select: { studentId: true, status: true, attestedAt: true },
  });
  if (!attempt || attempt.studentId !== user.id) return { error: "Not your attempt." };
  if (attempt.status !== "in_progress") return { error: "Attempt is closed." };
  if (!attempt.attestedAt) {
    await prisma.examAttempt.update({ where: { id: attemptId }, data: { attestedAt: new Date() } });
  }
  return { ok: true };
}

const INTEGRITY_EVENT_TYPES = new Set([
  "blur",
  "visibility_hidden",
  "fullscreen_exit",
  "copy",
  "paste",
  "contextmenu",
]);

/**
 * Records one client-side integrity signal (tab-switch, fullscreen exit, etc.),
 * increments the attempt's violation count, and — the server being the source of
 * truth — auto-submits the attempt once the exam's threshold is reached, even if
 * the client ignores the warning. Returns the running count and whether it closed.
 */
export async function logExamEvent(
  attemptId: string,
  type: string
): Promise<{ violationCount?: number; autoClosed?: boolean; error?: string }> {
  const user = await requireRole("STUDENT");
  if (!INTEGRITY_EVENT_TYPES.has(type)) return { error: "Unknown event." };

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    select: { studentId: true, status: true, violationCount: true, exam: { select: { maxViolations: true } } },
  });
  if (!attempt || attempt.studentId !== user.id) return { error: "Not your attempt." };
  if (attempt.status !== "in_progress") return { violationCount: attempt?.violationCount, autoClosed: true };

  const [, updated] = await prisma.$transaction([
    prisma.examAttemptEvent.create({ data: { attemptId, type } }),
    prisma.examAttempt.update({
      where: { id: attemptId },
      data: { violationCount: { increment: 1 } },
      select: { violationCount: true },
    }),
  ]);

  if (violationLimitReached(updated.violationCount, attempt.exam.maxViolations)) {
    await gradeExamAttempt(attemptId);
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: { autoClosedReason: "integrity" },
    });
    return { violationCount: updated.violationCount, autoClosed: true };
  }
  return { violationCount: updated.violationCount, autoClosed: false };
}

/** The admin per-student window override for an exam, or null if none. */
async function getWindowOverride(examId: string, studentId: string) {
  return prisma.examRetakeGrant.findUnique({
    where: { examId_studentId: { examId, studentId } },
    select: { startAtOverride: true, endAtOverride: true },
  });
}

export type AnswerInput = { questionId: string; response: string | boolean };

/** Upsert one answer, normalised to its question's type. */
async function persistAnswer(
  attemptId: string,
  questionId: string,
  type: string,
  response: string | boolean
) {
  const value = type === "true_false" ? Boolean(response) : String(response);
  await prisma.examAnswer.upsert({
    where: { attemptId_questionId: { attemptId, questionId } },
    create: { attemptId, questionId, response: value as never },
    update: { response: value as never },
  });
}

/**
 * Autosaves a single answer as the student picks it, so a server-side
 * auto-submit (timer expiry / abandoned attempt) grades their real progress.
 * Best-effort: rejects silently once the attempt is submitted or past deadline.
 */
export async function saveExamAnswer(
  attemptId: string,
  questionId: string,
  response: string | boolean
): Promise<{ ok?: boolean; error?: string }> {
  const user = await requireRole("STUDENT");

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { select: { durationMins: true, endAt: true, questions: { select: { id: true, type: true } } } },
    },
  });
  if (!attempt || attempt.studentId !== user.id) return { error: "Not your attempt." };
  if (attempt.status !== "in_progress") return { error: "Attempt is closed." };
  const saveEnd = effectiveWindowEnd(attempt.exam.endAt, await getWindowOverride(attempt.examId, user.id));
  if (isAttemptExpired(attempt.startedAt, attempt.exam.durationMins, saveEnd)) {
    return { error: "Time is up." };
  }

  const type = attempt.exam.questions.find((q) => q.id === questionId)?.type;
  if (!type) return { error: "Unknown question." };

  await persistAnswer(attemptId, questionId, type, response);
  return { ok: true };
}

/**
 * Records answers for an in-progress attempt and auto-grades it. Called on
 * manual submit and on timer expiry (client sends whatever's been answered).
 */
export async function submitExamAttempt(
  attemptId: string,
  answers: AnswerInput[]
): Promise<{ score?: number; passed?: boolean; error?: string }> {
  const user = await requireRole("STUDENT");

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { select: { durationMins: true, endAt: true, questions: { select: { id: true, type: true } } } },
    },
  });
  if (!attempt) return { error: "Attempt not found." };
  if (attempt.studentId !== user.id) return { error: "Not your attempt." };
  if (attempt.status !== "in_progress") return { error: "This attempt is already submitted." };

  // Past the deadline a late client submit can't inject fresh answers — we grade
  // whatever was autosaved before time ran out. On time, persist what was sent.
  const submitEnd = effectiveWindowEnd(attempt.exam.endAt, await getWindowOverride(attempt.examId, user.id));
  if (!isAttemptExpired(attempt.startedAt, attempt.exam.durationMins, submitEnd)) {
    const typeById = new Map(attempt.exam.questions.map((q) => [q.id, q.type]));
    for (const a of answers) {
      const type = typeById.get(a.questionId);
      if (!type) continue;
      await persistAnswer(attemptId, a.questionId, type, a.response);
    }
  }

  const result = await gradeExamAttempt(attemptId);

  revalidatePath("/account/exams");
  revalidatePath(`/account/exams/${attempt.examId}`);
  revalidatePath("/account");
  return result;
}

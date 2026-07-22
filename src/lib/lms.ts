import "server-only";
import { prisma } from "@/lib/prisma";
import { isAttemptExpired } from "@/lib/exams";

/**
 * Shared read helpers for the student portal / LMS. Keeps enrollment and
 * progress logic in one place so student pages, admin pages and server actions
 * agree on the numbers.
 */

/** Human label for a cohort, e.g. "Web Development — starts 12 Sep 2026". */
export function cohortLabel(cohort: {
  programme: { name: string };
  startDate: string;
}): string {
  return `${cohort.programme.name} — ${cohort.startDate}`;
}

/** Throws (via the caller's guard) unless the student has an active enrollment. */
export async function getActiveEnrollment(studentId: string, cohortId: string) {
  return prisma.enrollment.findFirst({
    where: { studentId, cohortId, status: { not: "withdrawn" } },
  });
}

/** Total lessons in a cohort and how many a student has completed. */
export async function cohortProgress(studentId: string, cohortId: string) {
  const total = await prisma.lesson.count({
    where: { module: { cohortId } },
  });
  const completed = await prisma.lessonProgress.count({
    where: { studentId, lesson: { module: { cohortId } } },
  });
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percent };
}

/** Attendance percentage for a student in a cohort (present / sessions held). */
export async function cohortAttendance(studentId: string, cohortId: string) {
  const held = await prisma.classSession.count({ where: { cohortId } });
  const present = await prisma.attendance.count({
    where: { studentId, present: true, session: { cohortId } },
  });
  const percent = held === 0 ? 0 : Math.round((present / held) * 100);
  return { held, present, percent };
}

/**
 * Auto-grades an exam attempt from its stored answers and persists the result.
 * Only objective question types exist (mcq, true_false), so grading is fully
 * automatic: each answer is compared to the question's stored `correct` value.
 * Shared by the student submit action so scoring lives in one place.
 * Returns the computed { score, passed }.
 */
export async function gradeExamAttempt(attemptId: string) {
  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { select: { passMark: true, questions: { select: { id: true, type: true, correct: true, marks: true } } } },
      answers: true,
    },
  });
  if (!attempt) throw new Error("Attempt not found.");

  // Grade over the questions this attempt was actually served (subset sampling).
  // Legacy attempts have no served set — fall back to the full question bank.
  const served = (attempt.servedQuestionIds as string[]) ?? [];
  const servedSet = new Set(served);
  const gradedQuestions =
    served.length > 0
      ? attempt.exam.questions.filter((q) => servedSet.has(q.id))
      : attempt.exam.questions;

  const answerByQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));
  const totalMarks = gradedQuestions.reduce((sum, q) => sum + q.marks, 0);
  let awardedTotal = 0;

  await prisma.$transaction(async (tx) => {
    for (const q of gradedQuestions) {
      const answer = answerByQuestion.get(q.id);
      const isCorrect = answer ? responsesMatch(q.type, answer.response, q.correct) : false;
      const awarded = isCorrect ? q.marks : 0;
      awardedTotal += awarded;
      if (answer) {
        await tx.examAnswer.update({ where: { id: answer.id }, data: { isCorrect, awarded } });
      }
    }
    const score = totalMarks === 0 ? 0 : Math.round((100 * awardedTotal) / totalMarks);
    const passed = score >= attempt.exam.passMark;
    await tx.examAttempt.update({
      where: { id: attemptId },
      data: { score, passed, status: "submitted", submittedAt: new Date() },
    });
  });

  const score = totalMarks === 0 ? 0 : Math.round((100 * awardedTotal) / totalMarks);
  return { score, passed: score >= attempt.exam.passMark };
}

/**
 * Auto-close an attempt that has run past its deadline: if it's still
 * `in_progress` and expired, grade whatever answers were stored (autosaved) and
 * mark it submitted. No-op otherwise. Used by the take page, the retake/start
 * flow, and the cron sweep so an abandoned attempt never lingers open.
 * Returns true when it finalized the attempt.
 */
export async function finalizeExpiredAttempt(attempt: {
  id: string;
  status: string;
  startedAt: Date;
  exam: { durationMins: number; endAt: Date | null };
}): Promise<boolean> {
  if (attempt.status !== "in_progress") return false;
  if (!isAttemptExpired(attempt.startedAt, attempt.exam.durationMins, attempt.exam.endAt)) {
    return false;
  }
  await gradeExamAttempt(attempt.id);
  return true;
}

/** Compare a student's stored response against a question's correct answer. */
function responsesMatch(type: string, response: unknown, correct: unknown): boolean {
  if (type === "true_false") return Boolean(response) === Boolean(correct);
  // mcq: option id string
  return String(response) === String(correct);
}

/** A student's best submitted score for an exam (or -1 if never attempted). */
export function bestExamScore(attempts: { score: number | null }[]): number {
  return attempts.reduce((max, a) => Math.max(max, a.score ?? 0), -1);
}

/**
 * Certificate eligibility per PRD §8.1: attendance ≥70%, all assignments
 * submitted, no assignment scored below the pass mark (default 50), and a
 * passing score on every scheduled exam in the cohort.
 * Returns the individual checks so the admin UI can explain gaps.
 */
export async function certificateEligibility(studentId: string, cohortId: string) {
  const attendance = await cohortAttendance(studentId, cohortId);

  const assignments = await prisma.assignment.findMany({
    where: { cohortId },
    select: {
      id: true,
      submissions: { where: { studentId }, select: { status: true, score: true } },
    },
  });
  const totalAssignments = assignments.length;
  const submittedCount = assignments.filter((a) => a.submissions.length > 0).length;
  const allSubmitted = totalAssignments === 0 || submittedCount === totalAssignments;

  const graded = assignments.flatMap((a) => a.submissions).filter((s) => s.score != null);
  const passedAll = graded.every((s) => (s.score ?? 0) >= 50);

  const attendanceOk = attendance.percent >= 70;

  // Exams: every scheduled exam must have a passing (best) attempt.
  const exams = await prisma.exam.findMany({
    where: { cohortId, status: "scheduled" },
    select: {
      passMark: true,
      attempts: { where: { studentId, status: "submitted" }, select: { score: true } },
    },
  });
  const totalExams = exams.length;
  const passedExams = exams.filter((ex) => bestExamScore(ex.attempts) >= ex.passMark).length;
  const examsPassed = totalExams === 0 || passedExams === totalExams;

  return {
    attendance,
    attendanceOk,
    totalAssignments,
    submittedCount,
    allSubmitted,
    passedAll,
    totalExams,
    passedExams,
    examsPassed,
    eligible: attendanceOk && allSubmitted && passedAll && examsPassed,
  };
}

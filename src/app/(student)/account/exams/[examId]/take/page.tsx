import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveEnrollment, finalizeExpiredAttempt } from "@/lib/lms";
import {
  studentExamPhase,
  examAttemptContext,
  attemptDeadline,
  effectiveWindowEnd,
} from "@/lib/exams";
import { TakeExam, type ClientQuestion } from "./take-exam";
import { ExamAttestation } from "@/components/exams/exam-attestation";

export const metadata = { title: "Taking exam" };
export const dynamic = "force-dynamic";

export default async function TakeExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const session = await auth();
  const user = session!.user;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!exam || exam.status !== "scheduled") redirect("/account/exams");

  const enrollment = await getActiveEnrollment(user.id, exam.cohortId);
  if (!enrollment) redirect("/account/exams");

  const attempt = await prisma.examAttempt.findFirst({
    where: { examId, studentId: user.id, status: "in_progress" },
  });
  if (!attempt) redirect(`/account/exams/${examId}`);

  // Any admin per-student window override reopens the exam and extends the
  // effective window end used for this attempt's deadline.
  const grant = await prisma.examRetakeGrant.findUnique({
    where: { examId_studentId: { examId, studentId: user.id } },
    select: { extraAttempts: true, startAtOverride: true, endAtOverride: true },
  });
  const effectiveEnd = effectiveWindowEnd(exam.endAt, grant);

  // If this attempt already ran past its deadline, auto-close it (grading the
  // autosaved answers) and send the student to their results rather than the paper.
  if (await finalizeExpiredAttempt({ ...attempt, exam: { ...exam, endAt: effectiveEnd } })) {
    redirect(`/account/exams/${examId}`);
  }

  // The exam window must still be open. Cooldown / attempt-limit / passed rules
  // only gate *starting* a new attempt, so an in-progress attempt may continue.
  const allAttempts = await prisma.examAttempt.findMany({
    where: { examId, studentId: user.id },
    select: { status: true, submittedAt: true, score: true },
  });
  const availability = studentExamPhase(
    exam,
    examAttemptContext(allAttempts, grant?.extraAttempts ?? 0, grant)
  );
  if (availability.phase === "upcoming" || availability.reason === "window") {
    redirect(`/account/exams/${examId}`);
  }

  // Integrity attestation gate — block the paper until the honour pledge is accepted.
  if (exam.requireAttestation && !attempt.attestedAt) {
    return (
      <ExamAttestation attemptId={attempt.id} title={exam.title} text={exam.attestationText} />
    );
  }

  // Render exactly the paper frozen at attempt creation: the served subset in its
  // stored order, with MCQ options in their stored (possibly shuffled) order. This
  // is stable across reloads and matches what grading scores. Legacy attempts with
  // no served set fall back to the full authored order.
  const byId = new Map(exam.questions.map((q) => [q.id, q]));
  const servedIds = (attempt.servedQuestionIds as string[]) ?? [];
  const orderedQuestions =
    servedIds.length > 0
      ? servedIds.map((id) => byId.get(id)).filter((q): q is (typeof exam.questions)[number] => Boolean(q))
      : exam.questions;
  const optionOrders = (attempt.optionOrders as Record<string, string[]>) ?? {};

  // Never expose the correct answers to the client.
  const questions: ClientQuestion[] = orderedQuestions.map((q) => {
    const options = (q.options as { id: string; text: string }[]) ?? [];
    const order = optionOrders[q.id];
    const ordered = order
      ? order.map((id) => options.find((o) => o.id === id)).filter((o): o is { id: string; text: string } => Boolean(o))
      : options;
    return {
      id: q.id,
      type: q.type as "mcq" | "true_false",
      text: q.text,
      marks: q.marks,
      options: ordered,
    };
  });

  // Deadline is the earlier of (start + duration) and the effective window close.
  const deadline = attemptDeadline(attempt.startedAt, exam.durationMins, effectiveEnd);

  return (
    <TakeExam
      examId={examId}
      attemptId={attempt.id}
      title={exam.title}
      deadline={deadline}
      questions={questions}
      integrity={{
        requireFullscreen: exam.requireFullscreen,
        trackFocus: exam.trackFocus,
        restrictCopyPaste: exam.restrictCopyPaste,
        maxViolations: exam.maxViolations,
        violationCount: attempt.violationCount,
      }}
    />
  );
}

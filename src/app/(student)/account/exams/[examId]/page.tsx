import { BackLink } from "@/components/ui/back-link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveEnrollment, bestExamScore } from "@/lib/lms";
import {
  studentExamPhase,
  examAttemptContext,
  isAttemptExpired,
  effectiveWindowEnd,
} from "@/lib/exams";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StartExamButton } from "../start-button";

export const metadata = { title: "Exam" };
export const dynamic = "force-dynamic";

export default async function StudentExamDetail({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const session = await auth();
  const user = session!.user;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      cohort: { include: { programme: { select: { name: true } } } },
      _count: { select: { questions: true } },
      attempts: {
        where: { studentId: user.id },
        orderBy: { attemptNo: "asc" },
      },
      retakeGrants: {
        where: { studentId: user.id },
        select: { extraAttempts: true, startAtOverride: true, endAtOverride: true },
      },
    },
  });
  if (!exam || exam.status !== "scheduled") redirect("/account/exams");

  const enrollment = await getActiveEnrollment(user.id, exam.cohortId);
  if (!enrollment) redirect("/account/exams");

  const grant = exam.retakeGrants[0] ?? null;
  const extraAttempts = grant?.extraAttempts ?? 0;
  const effectiveEnd = effectiveWindowEnd(exam.endAt, grant);
  const ctx = examAttemptContext(exam.attempts, extraAttempts, grant);
  const availability = studentExamPhase(exam, ctx);
  const phase = availability.phase;
  // Only a still-live in-progress attempt offers "Resume"; an expired one will
  // be auto-closed and a fresh attempt reopened when they click Start.
  const inProgress = exam.attempts.find(
    (a) => a.status === "in_progress" && !isAttemptExpired(a.startedAt, exam.durationMins, effectiveEnd)
  );
  const submitted = exam.attempts.filter((a) => a.status === "submitted");
  const best = bestExamScore(submitted);
  const effectiveMax = exam.maxAttempts + extraAttempts;
  const attemptsLeft = Math.max(0, effectiveMax - ctx.attemptsUsed);

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/account/exams" label="Back to exams" />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{exam.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{exam.cohort.programme.name}</p>
        </div>
        {phase === "open" ? (
          <Badge variant="success">Open now</Badge>
        ) : phase === "upcoming" ? (
          <Badge variant="outline">Upcoming</Badge>
        ) : phase === "cooldown" ? (
          <Badge variant="outline">Retake soon</Badge>
        ) : (
          <Badge variant="muted">Closed</Badge>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-5 text-sm shadow-soft sm:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Duration</dt>
          <dd className="font-medium">{exam.durationMins} min</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Questions</dt>
          <dd className="font-medium">{exam._count.questions}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Pass mark</dt>
          <dd className="font-medium">{exam.passMark}%</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Attempts left</dt>
          <dd className="font-medium">
            {attemptsLeft} / {effectiveMax}
            {extraAttempts > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">(+{extraAttempts} granted)</span>
            )}
          </dd>
        </div>
      </dl>

      {exam.instructions && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 text-sm shadow-soft">
          <div className="mb-1 font-semibold">Instructions</div>
          <p className="whitespace-pre-wrap text-muted-foreground">{exam.instructions}</p>
        </div>
      )}

      {phase === "upcoming" && (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          This exam opens on {exam.startAt ? formatDate(exam.startAt.toISOString()) : "the scheduled date"}.
        </p>
      )}

      {phase === "open" && (
        <div className="mt-6 flex items-center gap-4">
          <StartExamButton examId={exam.id} resume={!!inProgress} />
          <span className="text-sm text-muted-foreground">
            Closes {exam.endAt ? formatDate(exam.endAt.toISOString()) : "soon"}.
          </span>
        </div>
      )}

      {phase === "cooldown" && (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          You can retake this exam after{" "}
          {availability.readyAt ? formatDateTime(availability.readyAt.toISOString()) : "the cooldown period"}.
        </p>
      )}

      {phase === "closed" && availability.reason === "passed" && (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          You&apos;ve passed this exam — no further attempts are needed.
        </p>
      )}

      {phase === "closed" && availability.reason === "attempts" && (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          You&apos;ve used all your attempts for this exam.
        </p>
      )}

      {phase === "closed" && availability.reason === "window" && submitted.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          This exam is closed.
        </p>
      )}

      {submitted.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your results</h2>
            {best >= exam.passMark ? (
              <Badge variant="success">Best {best}% · Passed</Badge>
            ) : (
              <Badge variant="muted" className="text-destructive">Best {best}%</Badge>
            )}
          </div>
          <ul className="space-y-1 text-sm">
            {submitted.map((a) => (
              <li key={a.id} className="flex justify-between text-muted-foreground">
                <span>Attempt #{a.attemptNo}</span>
                <span className="font-medium text-foreground">{a.score}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bestExamScore } from "@/lib/lms";
import { studentExamPhase, examAttemptContext } from "@/lib/exams";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Exams" };
export const dynamic = "force-dynamic";

export default async function StudentExamsPage() {
  const session = await auth();
  const user = session!.user;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id, status: { not: "withdrawn" } },
    select: { cohortId: true },
  });
  const cohortIds = enrollments.map((e) => e.cohortId);

  const exams = await prisma.exam.findMany({
    where: { cohortId: { in: cohortIds }, status: "scheduled" },
    orderBy: { startAt: "asc" },
    include: {
      cohort: { include: { programme: { select: { name: true } } } },
      attempts: {
        where: { studentId: user.id },
        select: { score: true, status: true, submittedAt: true },
      },
      retakeGrants: {
        where: { studentId: user.id },
        select: { extraAttempts: true, startAtOverride: true, endAtOverride: true },
      },
    },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/account" label="Back to dashboard" />
      <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
      <p className="mt-1 text-sm text-muted-foreground">Computer-based tests across your cohorts.</p>

      {exams.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No exams scheduled yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {exams.map((e) => {
            const grant = e.retakeGrants[0] ?? null;
            const ctx = examAttemptContext(e.attempts, grant?.extraAttempts ?? 0, grant);
            const phase = studentExamPhase(e, ctx).phase;
            const submitted = e.attempts.filter((a) => a.status === "submitted");
            const best = bestExamScore(submitted);
            return (
              <Link
                key={e.id}
                href={`/account/exams/${e.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-ring"
              >
                <div>
                  <h2 className="font-semibold">{e.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {e.cohort.programme.name} · {e.durationMins} min · pass {e.passMark}%
                    {e.startAt && ` · opens ${formatDate(e.startAt.toISOString())}`}
                  </p>
                </div>
                {submitted.length > 0 && phase !== "open" ? (
                  best >= e.passMark ? (
                    <Badge variant="success">Passed · {best}%</Badge>
                  ) : (
                    <Badge variant="muted" className="text-destructive">Scored {best}%</Badge>
                  )
                ) : phase === "open" ? (
                  <Badge variant="success">Open now</Badge>
                ) : phase === "upcoming" ? (
                  <Badge variant="outline">Upcoming</Badge>
                ) : phase === "cooldown" ? (
                  <Badge variant="outline">Retake soon</Badge>
                ) : (
                  <Badge variant="muted">Closed</Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

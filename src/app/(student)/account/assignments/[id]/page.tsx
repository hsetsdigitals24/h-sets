import { BackLink } from "@/components/ui/back-link";
import { notFound, redirect } from "next/navigation";
import { Download } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveEnrollment } from "@/lib/lms";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SubmissionForm } from "../submission-form";

export const metadata = { title: "Assignment" };
export const dynamic = "force-dynamic";

export default async function AssignmentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const user = session!.user;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { cohort: { include: { programme: { select: { name: true } } } } },
  });
  if (!assignment) notFound();

  const enrollment = await getActiveEnrollment(user.id, assignment.cohortId);
  if (!enrollment) redirect("/account/assignments");

  const submission = await prisma.submission.findUnique({
    where: { assignmentId_studentId: { assignmentId: id, studentId: user.id } },
  });

  const overdue = assignment.dueDate < new Date();
  const graded = submission?.status === "graded";

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/account/assignments" label="Back to assignments" />
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{assignment.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {assignment.cohort.programme.name} · due {formatDate(assignment.dueDate.toISOString())} · max {assignment.maxScore}
          </p>
        </div>
        {graded ? (
          <Badge variant="success">Graded · {submission!.score}/{assignment.maxScore}</Badge>
        ) : submission ? (
          <Badge>Submitted</Badge>
        ) : (
          <Badge variant="outline">Not submitted</Badge>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-card p-5 text-sm shadow-soft">
        <p className="whitespace-pre-wrap text-muted-foreground">{assignment.description}</p>
      </div>

      {/* Graded feedback */}
      {graded && (
        <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="text-sm font-semibold text-emerald-700">
            Score: {submission!.score}/{assignment.maxScore}
          </div>
          {submission!.feedback && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{submission!.feedback}</p>
          )}
        </div>
      )}

      {/* Existing submission summary */}
      {submission && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="text-sm font-semibold">Your submission</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Submitted {formatDate(submission.submittedAt.toISOString())}
          </p>
          {submission.text && (
            <p className="mt-2 whitespace-pre-wrap text-sm">{submission.text}</p>
          )}
          {submission.r2Key && (
            <a
              href={`/api/submissions/${submission.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Download className="size-4" /> {submission.fileName ?? "Download file"}
            </a>
          )}
        </div>
      )}

      {/* Submission form (blocked only if overdue and never submitted) */}
      <div className="mt-6">
        {overdue && !submission ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            The deadline has passed. Contact your instructor if you need an extension.
          </p>
        ) : graded ? (
          <details>
            <summary className="cursor-pointer text-sm font-medium text-primary">Resubmit</summary>
            <div className="mt-4">
              <SubmissionForm assignmentId={assignment.id} submitted={!!submission} />
            </div>
          </details>
        ) : (
          <>
            <h2 className="mb-3 text-sm font-semibold">
              {submission ? "Update your submission" : "Submit your work"}
            </h2>
            <SubmissionForm assignmentId={assignment.id} submitted={!!submission} />
          </>
        )}
      </div>
    </div>
  );
}

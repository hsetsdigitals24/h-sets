import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { canManageCohort } from "@/lib/cohort-access";
import { formatDate } from "@/lib/utils";
import { PageHeading } from "@/components/admin/page-heading";
import { Badge } from "@/components/ui/badge";
import { GradeForm } from "../forms";

export const dynamic = "force-dynamic";

export default async function AssignmentSubmissionsPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const user = await requireSection("grading");
  const { assignmentId } = await params;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      cohort: { include: { programme: { select: { name: true } } } },
      submissions: {
        orderBy: { submittedAt: "asc" },
        include: { student: { select: { name: true, email: true } } },
      },
    },
  });
  if (!assignment) notFound();
  if (!(await canManageCohort(user, assignment.cohortId))) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: `/admin/grading?cohort=${assignment.cohortId}`, label: "Back to assignments" }}
        title={assignment.title}
        description={`${assignment.cohort.programme.name} · due ${formatDate(assignment.dueDate.toISOString())} · max ${assignment.maxScore}`}
      />

      {assignment.submissions.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No submissions yet.
        </p>
      ) : (
        <div className="space-y-4">
          {assignment.submissions.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.student.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.student.email} · submitted {formatDate(s.submittedAt.toISOString())}
                  </div>
                </div>
                {s.status === "graded" ? (
                  <Badge variant="success">Graded · {s.score}/{assignment.maxScore}</Badge>
                ) : (
                  <Badge>Awaiting grade</Badge>
                )}
              </div>

              <div className="mt-3 space-y-2 rounded-xl border border-border p-4 text-sm">
                {s.text && <p className="whitespace-pre-wrap">{s.text}</p>}
                {s.r2Key && (
                  <a
                    href={`/api/submissions/${s.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Download className="size-4" /> {s.fileName ?? "Download file"}
                  </a>
                )}
                {!s.text && !s.r2Key && <p className="text-muted-foreground">No content.</p>}
              </div>

              <div className="mt-4">
                <GradeForm
                  submissionId={s.id}
                  maxScore={assignment.maxScore}
                  defaultScore={s.score}
                  defaultFeedback={s.feedback}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

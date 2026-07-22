import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Assignments" };
export const dynamic = "force-dynamic";

export default async function AssignmentsListPage() {
  const session = await auth();
  const user = session!.user;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id, status: { not: "withdrawn" } },
    select: { cohortId: true },
  });
  const cohortIds = enrollments.map((e) => e.cohortId);

  const assignments = await prisma.assignment.findMany({
    where: { cohortId: { in: cohortIds } },
    orderBy: { dueDate: "asc" },
    include: {
      cohort: { include: { programme: { select: { name: true } } } },
      submissions: { where: { studentId: user.id } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/account" label="Back to dashboard" />
      <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everything due across your cohorts.</p>

      {assignments.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No assignments yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {assignments.map((a) => {
            const sub = a.submissions[0];
            const overdue = !sub && a.dueDate < new Date();
            return (
              <Link
                key={a.id}
                href={`/account/assignments/${a.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-ring"
              >
                <div>
                  <h2 className="font-semibold">{a.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {a.cohort.programme.name} · due {formatDate(a.dueDate.toISOString())}
                  </p>
                </div>
                {sub?.status === "graded" ? (
                  <Badge variant="success">Graded · {sub.score}/{a.maxScore}</Badge>
                ) : sub ? (
                  <Badge>Submitted</Badge>
                ) : overdue ? (
                  <Badge variant="muted" className="text-destructive">Overdue</Badge>
                ) : (
                  <Badge variant="outline">Not submitted</Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

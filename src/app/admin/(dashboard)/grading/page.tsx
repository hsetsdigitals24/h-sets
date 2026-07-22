import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { cohortScope, activeCohortWhere } from "@/lib/cohort-access";
import { cohortLabel } from "@/lib/lms";
import { formatDate } from "@/lib/utils";
import { PageHeading } from "@/components/admin/page-heading";
import { DeleteButton } from "@/components/admin/delete-button";
import { CohortPicker } from "@/components/lms/cohort-picker";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { AddAssignmentForm } from "./forms";
import { deleteAssignment } from "./actions";

export const dynamic = "force-dynamic";

export default async function GradingPage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string }>;
}) {
  const user = await requireSection("grading");
  const { cohort: cohortId } = await searchParams;

  const cohorts = await prisma.cohort.findMany({
    where: { ...cohortScope(user), ...activeCohortWhere() },
    include: { programme: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const options = cohorts.map((c) => ({ id: c.id, label: cohortLabel(c) }));

  const allowed = !!cohortId && cohorts.some((c) => c.id === cohortId);
  const assignments = allowed
    ? await prisma.assignment.findMany({
        where: { cohortId },
        orderBy: { dueDate: "asc" },
        include: { _count: { select: { submissions: true } } },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Assignments"
        description="Create assignments and grade student submissions."
        action={<CohortPicker cohorts={options} selected={cohortId} />}
      />

      {!allowed || !cohortId ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Select a cohort above.
        </p>
      ) : (
        <>
          <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 text-sm font-semibold">Create an assignment</h2>
            <AddAssignmentForm cohortId={cohortId} />
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No assignments yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/grading/${a.id}`} className="hover:underline">
                          {a.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(a.dueDate.toISOString())}
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">{a._count.submissions}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton id={a.id} action={deleteAssignment} confirmText={`Delete "${a.title}"?`} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}

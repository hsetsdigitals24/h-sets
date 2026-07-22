import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { cohortScope, activeCohortWhere } from "@/lib/cohort-access";
import { cohortLabel } from "@/lib/lms";
import { EXAM_STATUS_LABELS, examStatusVariant } from "@/lib/exams";
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
import { CreateExamForm } from "./forms";
import { deleteExam } from "./actions";

export const dynamic = "force-dynamic";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string }>;
}) {
  const user = await requireSection("exams");
  const { cohort: cohortId } = await searchParams;

  const cohorts = await prisma.cohort.findMany({
    where: { ...cohortScope(user), ...activeCohortWhere() },
    include: { programme: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const options = cohorts.map((c) => ({ id: c.id, label: cohortLabel(c) }));

  const allowed = !!cohortId && cohorts.some((c) => c.id === cohortId);
  const exams = allowed
    ? await prisma.exam.findMany({
        where: { cohortId },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { questions: true, attempts: true } } },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Exams (CBT)"
        description="Instructors build exams and submit them for review. Admins validate and schedule them."
        action={<CohortPicker cohorts={options} selected={cohortId} />}
      />

      {!allowed || !cohortId ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Select a cohort above.
        </p>
      ) : (
        <>
          <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 text-sm font-semibold">Create an exam</h2>
            <CreateExamForm cohortId={cohortId} />
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Window</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No exams yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/exams/${e.id}`} className="hover:underline">
                          {e.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={examStatusVariant(e.status)}>
                          {EXAM_STATUS_LABELS[e.status] ?? e.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {e.startAt ? formatDate(e.startAt.toISOString()) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">{e._count.questions}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">{e._count.attempts}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton id={e.id} action={deleteExam} confirmText={`Delete "${e.title}"?`} />
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

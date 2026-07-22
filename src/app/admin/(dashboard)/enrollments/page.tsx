import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { cohortLabel } from "@/lib/lms";
import { activeCohortWhere } from "@/lib/cohort-access";
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
import { EnrollForm } from "./enroll-form";
import { withdrawEnrollment } from "./actions";

export const dynamic = "force-dynamic";

export default async function EnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string }>;
}) {
  await requireSection("enrollments");
  const { cohort: cohortId } = await searchParams;

  const cohorts = await prisma.cohort.findMany({
    where: activeCohortWhere(),
    include: { programme: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const options = cohorts.map((c) => ({ id: c.id, label: cohortLabel(c) }));

  const enrollments = cohortId
    ? await prisma.enrollment.findMany({
        where: { cohortId },
        include: { student: { select: { name: true, email: true } } },
        orderBy: { enrolledAt: "asc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Enrollments"
        description="Assign students to a cohort. Students need a registered account first."
        action={<CohortPicker cohorts={options} selected={cohortId} />}
      />

      {!cohortId ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Select a cohort above to manage its students.
        </p>
      ) : (
        <>
          <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 text-sm font-semibold">Enroll a student</h2>
            <EnrollForm cohortId={cohortId} />
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No students enrolled yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  enrollments.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.student.name}</TableCell>
                      <TableCell className="text-muted-foreground">{e.student.email}</TableCell>
                      <TableCell>
                        <Badge variant={e.status === "completed" ? "success" : "muted"}>
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton
                          id={e.id}
                          action={withdrawEnrollment}
                          label="Withdraw"
                          confirmText={`Remove ${e.student.email} from this cohort?`}
                        />
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

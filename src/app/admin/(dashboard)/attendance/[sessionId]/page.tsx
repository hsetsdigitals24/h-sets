import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { canManageCohort } from "@/lib/cohort-access";
import { formatDate } from "@/lib/utils";
import { PageHeading } from "@/components/admin/page-heading";
import { ActionButton } from "@/components/lms/action-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { setAttendance } from "../actions";

export const dynamic = "force-dynamic";

export default async function RosterPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requireSection("attendance");
  const { sessionId } = await params;

  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    include: { cohort: { include: { programme: { select: { name: true } } } } },
  });
  if (!session) notFound();
  if (!(await canManageCohort(user, session.cohortId))) notFound();

  const [enrollments, records] = await Promise.all([
    prisma.enrollment.findMany({
      where: { cohortId: session.cohortId, status: { not: "withdrawn" } },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { enrolledAt: "asc" },
    }),
    prisma.attendance.findMany({ where: { sessionId }, select: { studentId: true, present: true } }),
  ]);
  const byStudent = new Map(records.map((r) => [r.studentId, r.present]));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: `/admin/attendance?cohort=${session.cohortId}`, label: "Back to sessions" }}
        title={session.title}
        description={`${session.cohort.programme.name} · ${formatDate(session.scheduledAt.toISOString())}`}
      />

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Mark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No students enrolled in this cohort.
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((e) => {
                const status = byStudent.get(e.student.id);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">
                      {e.student.name}
                      <div className="text-xs text-muted-foreground">{e.student.email}</div>
                    </TableCell>
                    <TableCell>
                      {status === true ? (
                        <Badge variant="success">Present</Badge>
                      ) : status === false ? (
                        <Badge variant="muted">Absent</Badge>
                      ) : (
                        <Badge variant="outline">Unmarked</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <ActionButton
                          action={setAttendance}
                          fields={{ sessionId, studentId: e.student.id, present: "true" }}
                          variant={status === true ? "gradient" : "outline"}
                          successMessage="Marked present"
                        >
                          Present
                        </ActionButton>
                        <ActionButton
                          action={setAttendance}
                          fields={{ sessionId, studentId: e.student.id, present: "false" }}
                          variant={status === false ? "default" : "outline"}
                          successMessage="Marked absent"
                        >
                          Absent
                        </ActionButton>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

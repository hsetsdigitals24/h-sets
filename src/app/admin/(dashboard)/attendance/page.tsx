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
import { SessionForm } from "./session-form";
import { deleteSession } from "./actions";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ cohort?: string }>;
}) {
  const user = await requireSection("attendance");
  const { cohort: cohortId } = await searchParams;

  const cohorts = await prisma.cohort.findMany({
    where: { ...cohortScope(user), ...activeCohortWhere() },
    include: { programme: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const options = cohorts.map((c) => ({ id: c.id, label: cohortLabel(c) }));

  const allowed = !!cohortId && cohorts.some((c) => c.id === cohortId);
  const sessions = allowed
    ? await prisma.classSession.findMany({
        where: { cohortId },
        orderBy: { scheduledAt: "asc" },
        include: { _count: { select: { attendance: true } } },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Attendance"
        description="Schedule live sessions and mark who attended."
        action={<CohortPicker cohorts={options} selected={cohortId} />}
      />

      {!allowed || !cohortId ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Select a cohort above.
        </p>
      ) : (
        <>
          <div className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 text-sm font-semibold">Schedule a session</h2>
            <SessionForm cohortId={cohortId} />
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Marked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No sessions yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/attendance/${s.id}`} className="hover:underline">
                          {s.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(s.scheduledAt.toISOString())}
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted">{s._count.attendance}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton id={s.id} action={deleteSession} confirmText={`Delete "${s.title}"?`} />
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

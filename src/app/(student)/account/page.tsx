import Link from "next/link";
import { BookOpen, ClipboardList, CalendarClock, Award } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cohortProgress, cohortAttendance } from "@/lib/lms";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const session = await auth();
  const user = session!.user;
  const firstName = user.name?.trim().split(/\s+/)[0] ?? "there";

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id, status: { not: "withdrawn" } },
    include: { cohort: { include: { programme: { select: { name: true } } } } },
    orderBy: { enrolledAt: "desc" },
  });

  const cards = await Promise.all(
    enrollments.map(async (e) => {
      const [progress, attendance, nextSession, pendingAssignments, certificate] = await Promise.all([
        cohortProgress(user.id, e.cohortId),
        cohortAttendance(user.id, e.cohortId),
        prisma.classSession.findFirst({
          where: { cohortId: e.cohortId, scheduledAt: { gte: new Date() } },
          orderBy: { scheduledAt: "asc" },
        }),
        prisma.assignment.count({
          where: { cohortId: e.cohortId, submissions: { none: { studentId: user.id } } },
        }),
        prisma.certificate.findUnique({
          where: { studentId_cohortId: { studentId: user.id, cohortId: e.cohortId } },
        }),
      ]);
      return { enrollment: e, progress, attendance, nextSession, pendingAssignments, certificate };
    })
  );

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-sm font-medium text-primary">Welcome back</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Hi, {firstName}</h1>
      <p className="mt-2 text-muted-foreground">
        {enrollments.length > 0
          ? "Pick up where you left off across your cohorts."
          : "You're not enrolled in a cohort yet."}
      </p>

      {enrollments.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Once the Academy team enrolls you in a cohort, it will appear here.
          </p>
          <Button asChild variant="gradient" className="mt-4">
            <Link href="/academy">Browse programmes</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {cards.map(({ enrollment: e, progress, attendance, nextSession, pendingAssignments, certificate }) => (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{e.cohort.programme.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {e.cohort.startDate} – {e.cohort.endDate} · {e.cohort.format}
                  </p>
                </div>
                {certificate && !certificate.revoked ? (
                  <Badge variant="success">Certified</Badge>
                ) : e.status === "completed" ? (
                  <Badge variant="muted">Completed</Badge>
                ) : (
                  <Badge>Active</Badge>
                )}
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Course progress</span>
                  <span className="font-medium">
                    {progress.completed}/{progress.total} lessons · {progress.percent}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${progress.percent}%` }} />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Stat icon={CalendarClock} label="Next session">
                  {nextSession ? formatDate(nextSession.scheduledAt.toISOString()) : "None scheduled"}
                </Stat>
                <Stat icon={ClipboardList} label="Pending assignments">
                  {pendingAssignments}
                </Stat>
                <Stat icon={Award} label="Attendance">
                  {attendance.held === 0 ? "—" : `${attendance.percent}%`}
                </Stat>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild variant="gradient" size="sm">
                  <Link href={`/account/learn/${e.cohortId}`}>
                    <BookOpen className="size-4" /> Continue learning
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/account/assignments">Assignments</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{children}</div>
    </div>
  );
}

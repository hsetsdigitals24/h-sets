import Link from "next/link";
import { Prisma } from "@prisma/client";
import { GraduationCap, Layers, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { cohortScope } from "@/lib/cohort-access";
import { formatDate } from "@/lib/utils";
import { PageHeading } from "@/components/admin/page-heading";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { StudentsFilters } from "./filters";

export const dynamic = "force-dynamic";

const STATUSES = ["active", "completed", "withdrawn"] as const;

function statusVariant(status: string) {
  if (status === "completed") return "success" as const;
  if (status === "withdrawn") return "outline" as const;
  return "muted" as const;
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; programme?: string; status?: string }>;
}) {
  const user = await requireSection("students");
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const programmeId = params.programme || undefined;
  const status = STATUSES.find((s) => s === params.status);

  // Name/email search is applied to the enrollment's student, so a cohort only
  // shows the students that match.
  const studentMatch: Prisma.UserWhereInput | undefined = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : undefined;

  const cohorts = await prisma.cohort.findMany({
    where: {
      ...cohortScope(user),
      ...(programmeId ? { programmeId } : {}),
    },
    include: {
      programme: { select: { id: true, name: true, level: true, category: true } },
      enrollments: {
        where: {
          ...(status ? { status } : {}),
          ...(studentMatch ? { student: studentMatch } : {}),
        },
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { student: { name: "asc" } },
      },
    },
    orderBy: [{ startDate: "desc" }],
  });

  // Group cohorts under their programme, newest cohort first within each.
  const byProgramme = new Map<
    string,
    { programme: (typeof cohorts)[number]["programme"]; cohorts: typeof cohorts }
  >();
  for (const cohort of cohorts) {
    const entry = byProgramme.get(cohort.programme.id) ?? {
      programme: cohort.programme,
      cohorts: [] as typeof cohorts,
    };
    entry.cohorts.push(cohort);
    byProgramme.set(cohort.programme.id, entry);
  }
  const groups = [...byProgramme.values()]
    .map((g) => ({
      ...g,
      // With a search or status filter on, empty cohorts are noise.
      cohorts: q || status ? g.cohorts.filter((c) => c.enrollments.length > 0) : g.cohorts,
    }))
    .filter((g) => g.cohorts.length > 0)
    .sort((a, b) => a.programme.name.localeCompare(b.programme.name));

  // A student enrolled in two cohorts is still one student.
  const uniqueStudents = new Set(
    groups.flatMap((g) => g.cohorts.flatMap((c) => c.enrollments.map((e) => e.studentId)))
  );
  const cohortCount = groups.reduce((n, g) => n + g.cohorts.length, 0);

  const programmes = await prisma.programme.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const filtered = Boolean(q || programmeId || status);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Students"
        description="Every enrolled student, grouped by programme and cohort."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Students" value={uniqueStudents.size} icon={Users} />
        <StatCard label="Programmes" value={groups.length} icon={GraduationCap} />
        <StatCard label="Cohorts" value={cohortCount} icon={Layers} />
      </div>

      <StudentsFilters
        programmes={programmes}
        current={{ q, programme: programmeId, status }}
        active={filtered}
      />

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {filtered
            ? "No students match these filters."
            : "No cohorts with students yet."}
        </p>
      ) : (
        <div className="space-y-8">
          {groups.map(({ programme, cohorts: programmeCohorts }) => {
            const total = programmeCohorts.reduce((n, c) => n + c.enrollments.length, 0);
            return (
              <section key={programme.id}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">{programme.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {programme.level} · {programme.category}
                    </p>
                  </div>
                  <Badge variant="muted">
                    {total} {total === 1 ? "student" : "students"} ·{" "}
                    {programmeCohorts.length}{" "}
                    {programmeCohorts.length === 1 ? "cohort" : "cohorts"}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {programmeCohorts.map((cohort) => (
                    <details
                      key={cohort.id}
                      open
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
                    >
                      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm">
                        <span className="font-medium">
                          {formatDate(cohort.startDate)} – {formatDate(cohort.endDate)}
                          <span className="ml-2 font-normal text-muted-foreground">
                            {cohort.format}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Badge variant="outline">{cohort.status}</Badge>
                          <Badge variant="default">
                            {cohort.enrollments.length} enrolled
                          </Badge>
                        </span>
                      </summary>

                      {cohort.enrollments.length === 0 ? (
                        <p className="border-t border-border px-5 py-6 text-center text-sm text-muted-foreground">
                          No students enrolled in this cohort yet.{" "}
                          <Link
                            href={`/admin/enrollments?cohort=${cohort.id}`}
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            Enroll someone
                          </Link>
                          .
                        </p>
                      ) : (
                        <div className="border-t border-border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Enrolled</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cohort.enrollments.map((e) => (
                                <TableRow key={e.id}>
                                  <TableCell className="font-medium">{e.student.name}</TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {e.student.email}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={statusVariant(e.status)}>{e.status}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right text-muted-foreground">
                                    {formatDate(e.enrolledAt.toISOString())}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </details>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

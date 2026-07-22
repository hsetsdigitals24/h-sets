import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { cn, formatDate } from "@/lib/utils";
import { PageHeading } from "@/components/admin/page-heading";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ReviewActions } from "./review-actions";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number];

const badgeVariant: Record<Status, "default" | "success" | "muted"> = {
  pending: "default",
  approved: "success",
  rejected: "muted",
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireSection("applications");
  const { status } = await searchParams;
  const active: Status = STATUSES.includes(status as Status) ? (status as Status) : "pending";

  const [applications, counts] = await Promise.all([
    prisma.application.findMany({
      where: { status: active },
      include: { cohort: { include: { programme: { select: { name: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.application.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (s: Status) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Applications"
        description="Review registration forms and admit students into their cohort."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/applications?status=${s}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
              active === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-secondary"
            )}
          >
            {s} ({countFor(s)})
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Cohort</TableHead>
              <TableHead>Submitted</TableHead>
              {active === "pending" ? (
                <TableHead className="text-right">Review</TableHead>
              ) : (
                <TableHead>Status</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No {active} applications.
                </TableCell>
              </TableRow>
            ) : (
              applications.map((a) => (
                <TableRow key={a.id} className="align-top">
                  <TableCell>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.email}</div>
                    {a.phone && <div className="text-xs text-muted-foreground">{a.phone}</div>}
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer text-primary">Background & motivation</summary>
                      <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                        <span className="font-medium text-foreground">Background: </span>
                        {a.background}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                        <span className="font-medium text-foreground">Motivation: </span>
                        {a.motivation}
                      </p>
                      {a.reviewNote && (
                        <p className="mt-1 text-muted-foreground">
                          <span className="font-medium text-foreground">Review note: </span>
                          {a.reviewNote}
                        </p>
                      )}
                    </details>
                  </TableCell>
                  <TableCell>
                    <div>{a.cohort.programme.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Starts {formatDate(a.cohort.startDate)}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(a.createdAt.toISOString())}</TableCell>
                  {active === "pending" ? (
                    <TableCell>
                      <ReviewActions id={a.id} />
                    </TableCell>
                  ) : (
                    <TableCell>
                      <Badge variant={badgeVariant[active]} className="capitalize">
                        {a.status}
                      </Badge>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

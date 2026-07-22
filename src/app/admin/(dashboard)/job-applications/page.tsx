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
import { ReviewActions, DownloadCv } from "./review-actions";

export const dynamic = "force-dynamic";

const STATUSES = ["pending", "reviewed", "rejected"] as const;
type Status = (typeof STATUSES)[number];

const badgeVariant: Record<Status, "default" | "success" | "muted"> = {
  pending: "default",
  reviewed: "success",
  rejected: "muted",
};

export default async function JobApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireSection("job-applications");
  const { status } = await searchParams;
  const active: Status = STATUSES.includes(status as Status) ? (status as Status) : "pending";

  const [applications, counts] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { status: active },
      include: { job: { select: { title: true, company: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.jobApplication.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (s: Status) => counts.find((c) => c.status === s)?._count ?? 0;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Job Applications"
        description="Applications submitted through the public careers job board."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/job-applications?status=${s}`}
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
              <TableHead>Role</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">
                {active === "pending" ? "Review" : "Status"}
              </TableHead>
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
                      <summary className="cursor-pointer text-primary">Cover note</summary>
                      <p className="mt-2 whitespace-pre-wrap text-muted-foreground">
                        {a.coverNote}
                      </p>
                      {a.reviewNote && (
                        <p className="mt-1 text-muted-foreground">
                          <span className="font-medium text-foreground">Review note: </span>
                          {a.reviewNote}
                        </p>
                      )}
                    </details>
                    {a.cvKey && (
                      <div className="mt-2">
                        <DownloadCv id={a.id} />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>{a.job.title}</div>
                    <div className="text-xs text-muted-foreground">{a.job.company}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(a.createdAt.toISOString())}
                  </TableCell>
                  {active === "pending" ? (
                    <TableCell>
                      <ReviewActions id={a.id} />
                    </TableCell>
                  ) : (
                    <TableCell className="text-right">
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

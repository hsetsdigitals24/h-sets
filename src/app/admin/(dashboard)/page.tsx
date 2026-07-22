import Link from "next/link";
import { Inbox, GraduationCap, Briefcase, Newspaper, ClipboardList } from "lucide-react";
import { prisma } from "@/lib/prisma";
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

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [newLeads, totalLeads, cohorts, jobs, insights, pendingApplications, recentLeads] =
    await Promise.all([
      prisma.lead.count({ where: { status: "new" } }),
      prisma.lead.count(),
      prisma.cohort.count(),
      prisma.job.count(),
      prisma.insight.count(),
      prisma.application.count({ where: { status: "pending" } }),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

  return (
    <div>
      <PageHeading
        title="Overview"
        description="A snapshot of your platform activity."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="New leads" value={newLeads} icon={Inbox} />
        <StatCard label="Total leads" value={totalLeads} icon={Inbox} />
        <StatCard label="Cohorts" value={cohorts} icon={GraduationCap} />
        <StatCard label="Open jobs" value={jobs} icon={Briefcase} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Insights" value={insights} icon={Newspaper} />
        <Link href="/admin/applications">
          <StatCard label="Pending applications" value={pendingApplications} icon={ClipboardList} />
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent submissions</h2>
          <Link href="/admin/leads" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No submissions yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLeads.map((lead) => (
                <TableRow key={lead.id.toString()}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/leads/${lead.id}`} className="hover:underline">
                      {lead.name ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="muted">{lead.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.createdAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { deleteJob, toggleJobPublished } from "./actions";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  await requireSection("jobs");
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Jobs"
        description="Manage the careers job board."
        action={
          <Button asChild size="sm">
            <Link href="/admin/jobs/new">
              <Plus className="size-4" /> New job
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        {jobs.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No jobs yet. Create your first listing.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/jobs/${job.id}`} className="hover:underline">
                      {job.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{job.company}</TableCell>
                  <TableCell>
                    <Badge variant="muted">{job.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <PublishToggle
                      id={job.id}
                      published={job.published}
                      action={toggleJobPublished}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/jobs/${job.id}`}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <DeleteButton id={job.id} action={deleteJob} confirmText="Delete this job?" />
                    </div>
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

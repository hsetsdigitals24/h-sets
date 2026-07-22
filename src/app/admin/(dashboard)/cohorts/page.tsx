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
import { deleteCohort, toggleCohortPublished } from "./actions";

export const dynamic = "force-dynamic";

export default async function CohortsPage() {
  await requireSection("cohorts");
  const cohorts = await prisma.cohort.findMany({
    include: {
      programme: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div>
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Cohorts"
        description="Time-bound programme intakes across the Academy."
        action={
          <Button asChild size="sm">
            <Link href="/admin/cohorts/new">
              <Plus className="size-4" /> New cohort
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        {cohorts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No cohorts yet. Create your first intake.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Programme</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cohorts.map((cohort) => (
                <TableRow key={cohort.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/cohorts/${cohort.id}`} className="hover:underline">
                      {cohort.programme.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{cohort.startDate}</TableCell>
                  <TableCell className="text-muted-foreground">{cohort.endDate}</TableCell>
                  <TableCell>
                    <Badge variant="muted">{cohort.format}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {cohort.seatsLeft}/{cohort.seatsTotal}
                  </TableCell>
                  <TableCell>
                    <Badge variant="muted">{cohort.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <PublishToggle
                      id={cohort.id}
                      published={cohort.published}
                      action={toggleCohortPublished}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/cohorts/${cohort.id}`}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <DeleteButton
                        id={cohort.id}
                        action={deleteCohort}
                        confirmText="Delete this cohort?"
                      />
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

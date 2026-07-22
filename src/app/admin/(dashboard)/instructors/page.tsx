import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { deleteInstructor } from "./actions";

export const dynamic = "force-dynamic";

export default async function InstructorsPage() {
  await requireSection("instructors");
  const instructors = await prisma.instructor.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { programmes: true } } },
  });

  return (
    <div>
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Instructors"
        description="Instructor profiles used across academy programmes."
        action={
          <Button asChild size="sm">
            <Link href="/admin/instructors/new">
              <Plus className="size-4" /> New instructor
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        {instructors.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No instructors yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Programmes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((ins) => (
                <TableRow key={ins.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/instructors/${ins.id}`} className="hover:underline">
                      {ins.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ins.title}</TableCell>
                  <TableCell className="text-muted-foreground">{ins._count.programmes}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/instructors/${ins.id}`}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <DeleteButton
                        id={ins.id}
                        action={deleteInstructor}
                        confirmText="Delete this instructor? Linked programmes will be unlinked."
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

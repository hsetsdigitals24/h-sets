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
import { deleteResource, toggleResourcePublished } from "./actions";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  await requireSection("resources");
  const items = await prisma.resource.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Resources"
        description="Gated lead-magnet downloads."
        action={
          <Button asChild size="sm">
            <Link href="/admin/resources/new">
              <Plus className="size-4" /> New resource
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No resources yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Gate</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/resources/${r.id}`} className="hover:underline">
                      {r.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="muted">{r.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.gate}</TableCell>
                  <TableCell>
                    <PublishToggle id={r.id} published={r.published} action={toggleResourcePublished} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/resources/${r.id}`}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <DeleteButton id={r.id} action={deleteResource} confirmText="Delete this resource?" />
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

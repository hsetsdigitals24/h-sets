import Link from "next/link";
import { Plus, Pencil, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { PublishToggle } from "@/components/admin/publish-toggle";
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
import { deleteTestimonial, toggleTestimonialPublished } from "./actions";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  await requireSection("testimonials");
  const items = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Testimonials"
        description="Social proof shown across the site."
        action={
          <Button asChild size="sm">
            <Link href="/admin/testimonials/new">
              <Plus className="size-4" /> New testimonial
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No testimonials yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/testimonials/${t.id}`} className="hover:underline">
                      {t.name}
                    </Link>
                    <span className="text-muted-foreground"> · {t.role}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.company}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      {t.rating}
                      <Star className="size-3.5 fill-star text-star" />
                    </span>
                  </TableCell>
                  <TableCell>
                    <PublishToggle id={t.id} published={t.published} action={toggleTestimonialPublished} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/testimonials/${t.id}`}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <DeleteButton id={t.id} action={deleteTestimonial} confirmText="Delete this testimonial?" />
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

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
import { deletePortfolioItem, togglePortfolioItemPublished } from "./actions";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  await requireSection("portfolio");
  const items = await prisma.portfolio.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Portfolio"
        description="Evidence-based client success stories."
        action={
          <Button asChild size="sm">
            <Link href="/admin/portfolio/new">
              <Plus className="size-4" /> New portfolio item
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No portfolio items yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((cs) => (
                <TableRow key={cs.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/portfolio/${cs.id}`} className="hover:underline">
                      {cs.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{cs.client}</TableCell>
                  <TableCell>
                    <Badge variant="muted">{cs.industry}</Badge>
                  </TableCell>
                  <TableCell>
                    <PublishToggle id={cs.id} published={cs.published} action={togglePortfolioItemPublished} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/portfolio/${cs.id}`}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <DeleteButton id={cs.id} action={deletePortfolioItem} confirmText="Delete this portfolio item?" />
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

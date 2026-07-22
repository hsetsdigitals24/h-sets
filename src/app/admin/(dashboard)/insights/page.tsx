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
import { deleteInsight, toggleInsightPublished } from "./actions";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  await requireSection("insights");
  const insights = await prisma.insight.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Insights"
        description="Manage blog posts shown on /insights."
        action={
          <Button asChild size="sm">
            <Link href="/admin/insights/new">
              <Plus className="size-4" /> New insight
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        {insights.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No insights yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insights.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/insights/${post.id}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="muted">{post.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{post.date}</TableCell>
                  <TableCell>
                    <PublishToggle
                      id={post.id}
                      published={post.published}
                      action={toggleInsightPublished}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/insights/${post.id}`}>
                          <Pencil className="size-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <DeleteButton id={post.id} action={deleteInsight} confirmText="Delete this insight?" />
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

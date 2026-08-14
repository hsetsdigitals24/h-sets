import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KIND_LABELS, type FinanceKind } from "@/lib/finance";
import { CategoryForm } from "./category-form";
import { archiveCategory } from "../actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requireSection("finance");
  const categories = await prisma.financeCategory.findMany({
    orderBy: [{ kind: "asc" }, { name: "asc" }],
    include: { _count: { select: { transactions: true } } },
  });

  const byKind = (k: FinanceKind) => categories.filter((c) => c.kind === k);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-1 text-sm font-semibold">Add a category</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Categories group your transactions and are the lines you plan against in a budget.
        </p>
        <CategoryForm />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {(["income", "expense"] as FinanceKind[]).map((kind) => {
          const list = byKind(kind);
          return (
            <section key={kind} className="rounded-2xl border border-border bg-card shadow-soft">
              <div className="border-b border-border p-4">
                <h2 className="text-sm font-semibold">{KIND_LABELS[kind]} categories</h2>
              </div>
              {list.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No {KIND_LABELS[kind].toLowerCase()} categories yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {list.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <span className={`font-medium ${c.archived ? "text-muted-foreground line-through" : ""}`}>
                          {c.name}
                        </span>
                        {c.archived && (
                          <Badge variant="muted" className="ml-2">
                            Archived
                          </Badge>
                        )}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {c._count.transactions} entr{c._count.transactions === 1 ? "y" : "ies"}
                        </span>
                      </div>
                      <form action={archiveCategory}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="archived" value={c.archived ? "false" : "true"} />
                        <Button type="submit" variant="outline" size="sm">
                          {c.archived ? "Restore" : "Archive"}
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

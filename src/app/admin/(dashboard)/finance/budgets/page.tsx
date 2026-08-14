import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatNGN } from "@/lib/utils";
import { periodLabel } from "@/lib/finance";
import { BudgetForm } from "./budget-form";
import { deleteBudget } from "../actions";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
  await requireSection("finance");
  const budgets = await prisma.budget.findMany({
    orderBy: { periodStart: "desc" },
    include: { lines: { include: { category: true } } },
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-1 text-sm font-semibold">Create a budget</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Set a period, then plan an amount per category. Actuals are pulled from your transactions in that window.
        </p>
        <BudgetForm />
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border p-4">
          <h2 className="text-sm font-semibold">Budgets</h2>
        </div>
        {budgets.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No budgets yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {budgets.map((b) => {
              const plannedIncome = b.lines
                .filter((l) => l.category.kind === "income")
                .reduce((s, l) => s + l.planned, 0);
              const plannedExpense = b.lines
                .filter((l) => l.category.kind === "expense")
                .reduce((s, l) => s + l.planned, 0);
              return (
                <li key={b.id} className="flex items-center justify-between gap-4 px-4 py-4">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/finance/budgets/${b.id}`}
                      className="font-semibold hover:underline"
                    >
                      {b.name}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="muted">{periodLabel(b.periodStart, b.periodEnd)}</Badge>
                      <span>Planned revenue {formatNGN(plannedIncome)}</span>
                      <span>·</span>
                      <span>Planned expenditure {formatNGN(plannedExpense)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DeleteButton
                      id={b.id}
                      action={deleteBudget}
                      confirmText={`Delete budget "${b.name}" and its plan lines?`}
                    />
                    <Link
                      href={`/admin/finance/budgets/${b.id}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
                    >
                      Open
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

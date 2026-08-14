import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
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
import { formatNGN } from "@/lib/utils";
import { KIND_LABELS, periodLabel, netAmount, type FinanceKind } from "@/lib/finance";
import { BudgetLineInput } from "./budget-line-input";

export const dynamic = "force-dynamic";

export default async function BudgetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("finance");
  const { id } = await params;

  const budget = await prisma.budget.findUnique({
    where: { id },
    include: { lines: true },
  });
  if (!budget) notFound();

  const [categories, actuals] = await Promise.all([
    prisma.financeCategory.findMany({
      where: { OR: [{ archived: false }, { budgetLines: { some: { budgetId: id } } }] },
      orderBy: [{ kind: "asc" }, { name: "asc" }],
    }),
    prisma.financeTransaction.groupBy({
      by: ["categoryId"],
      where: { occurredAt: { gte: budget.periodStart, lte: budget.periodEnd } },
      _sum: { amount: true },
    }),
  ]);

  const plannedByCat = new Map(budget.lines.map((l) => [l.categoryId, l.planned]));
  const actualByCat = new Map(
    actuals.filter((a) => a.categoryId).map((a) => [a.categoryId as string, a._sum.amount ?? 0])
  );

  const rows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    kind: c.kind as FinanceKind,
    planned: plannedByCat.get(c.id) ?? 0,
    actual: actualByCat.get(c.id) ?? 0,
  }));

  const section = (kind: FinanceKind) => rows.filter((r) => r.kind === kind);
  const totals = (kind: FinanceKind) => {
    const list = section(kind);
    return {
      planned: list.reduce((s, r) => s + r.planned, 0),
      actual: list.reduce((s, r) => s + r.actual, 0),
    };
  };

  const inc = totals("income");
  const exp = totals("expense");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{budget.name}</h2>
            <Badge variant="muted">{periodLabel(budget.periodStart, budget.periodEnd)}</Badge>
          </div>
          {budget.note && <p className="mt-1 text-sm text-muted-foreground">{budget.note}</p>}
        </div>
        <Link href="/admin/finance/budgets" className="text-sm font-medium text-primary hover:underline">
          ← All budgets
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Planned net" value={formatNGN(netAmount(inc.planned, exp.planned))} />
        <StatCard label="Actual net" value={formatNGN(netAmount(inc.actual, exp.actual))} />
        <StatCard label="Revenue actual / plan" value={`${formatNGN(inc.actual)} / ${formatNGN(inc.planned)}`} />
        <StatCard label="Expenditure actual / plan" value={`${formatNGN(exp.actual)} / ${formatNGN(exp.planned)}`} />
      </div>

      {(["income", "expense"] as FinanceKind[]).map((kind) => {
        const list = section(kind);
        const t = totals(kind);
        // For revenue, favourable variance is actual above plan; for expenditure
        // it is spending below plan (remaining budget).
        const variance = (planned: number, actual: number) =>
          kind === "income" ? actual - planned : planned - actual;
        const varLabel = kind === "income" ? "Δ vs plan" : "Remaining";

        return (
          <section key={kind} className="rounded-2xl border border-border bg-card shadow-soft">
            <div className="border-b border-border p-4">
              <h3 className="text-sm font-semibold">{KIND_LABELS[kind]}</h3>
            </div>
            {list.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No {KIND_LABELS[kind].toLowerCase()} categories.{" "}
                <Link href="/admin/finance/categories" className="text-primary hover:underline">
                  Add some
                </Link>{" "}
                to plan against.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Planned</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">{varLabel}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((r) => {
                    const v = variance(r.planned, r.actual);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-right">
                          <BudgetLineInput budgetId={budget.id} categoryId={r.id} planned={r.planned} />
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatNGN(r.actual)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            v < 0 ? "text-destructive" : "text-emerald-600"
                          }`}
                        >
                          {formatNGN(v)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{formatNGN(t.planned)}</TableCell>
                    <TableCell className="text-right">{formatNGN(t.actual)}</TableCell>
                    <TableCell
                      className={`text-right ${
                        variance(t.planned, t.actual) < 0 ? "text-destructive" : "text-emerald-600"
                      }`}
                    >
                      {formatNGN(variance(t.planned, t.actual))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            )}
          </section>
        );
      })}
    </div>
  );
}

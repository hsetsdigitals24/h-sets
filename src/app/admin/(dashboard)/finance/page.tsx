import Link from "next/link";
import { TrendingUp, TrendingDown, Scale, CalendarRange } from "lucide-react";
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
import { formatNGN, formatDate } from "@/lib/utils";
import { KIND_LABELS, monthRange, periodLabel, netAmount, type FinanceKind } from "@/lib/finance";

export const dynamic = "force-dynamic";

async function sumFor(kind: FinanceKind, range?: { start: Date; end: Date }) {
  const res = await prisma.financeTransaction.aggregate({
    _sum: { amount: true },
    where: {
      kind,
      ...(range ? { occurredAt: { gte: range.start, lte: range.end } } : {}),
    },
  });
  return res._sum.amount ?? 0;
}

export default async function FinanceOverviewPage() {
  await requireSection("finance");
  const { start, end } = monthRange();

  const [monthIncome, monthExpense, allIncome, allExpense, recent] = await Promise.all([
    sumFor("income", { start, end }),
    sumFor("expense", { start, end }),
    sumFor("income"),
    sumFor("expense"),
    prisma.financeTransaction.findMany({
      orderBy: { occurredAt: "desc" },
      take: 8,
      include: { category: true },
    }),
  ]);

  const monthNet = netAmount(monthIncome, monthExpense);
  const allNet = netAmount(allIncome, allExpense);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <CalendarRange className="size-4" />
          This month · {periodLabel(start, end)}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Revenue" value={formatNGN(monthIncome)} icon={TrendingUp} />
          <StatCard label="Expenditure" value={formatNGN(monthExpense)} icon={TrendingDown} />
          <StatCard
            label="Net"
            value={formatNGN(monthNet)}
            icon={Scale}
            className={monthNet < 0 ? "border-destructive/40" : ""}
          />
        </div>
      </section>

      <section>
        <div className="mb-3 text-sm font-medium text-muted-foreground">All time</div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard label="Total revenue" value={formatNGN(allIncome)} icon={TrendingUp} />
          <StatCard label="Total expenditure" value={formatNGN(allExpense)} icon={TrendingDown} />
          <StatCard
            label="Net position"
            value={formatNGN(allNet)}
            icon={Scale}
            className={allNet < 0 ? "border-destructive/40" : ""}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent entries</h2>
          <Link
            href="/admin/finance/transactions"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No transactions recorded yet.{" "}
            <Link href="/admin/finance/transactions" className="text-primary hover:underline">
              Add your first entry
            </Link>
            .
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(t.occurredAt.toISOString())}
                  </TableCell>
                  <TableCell className="font-medium">{t.description}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.category?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.kind === "income" ? "success" : "muted"}>
                      {KIND_LABELS[t.kind as FinanceKind] ?? t.kind}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      t.kind === "income" ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {t.kind === "income" ? "+" : "−"}
                    {formatNGN(t.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}

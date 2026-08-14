import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatNGN, formatDate } from "@/lib/utils";
import {
  KIND_LABELS,
  METHOD_LABELS,
  isFinanceKind,
  type FinanceKind,
  type FinanceMethod,
} from "@/lib/finance";
import { TransactionForm } from "./transaction-form";
import { deleteTransaction } from "../actions";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "", label: "All" },
  { key: "income", label: "Revenue" },
  { key: "expense", label: "Expenditure" },
];

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  await requireSection("finance");
  const { kind } = await searchParams;
  const activeKind = isFinanceKind(kind) ? kind : undefined;

  const where: Prisma.FinanceTransactionWhereInput = activeKind ? { kind: activeKind } : {};

  const [categories, transactions] = await Promise.all([
    prisma.financeCategory.findMany({
      where: { archived: false },
      orderBy: [{ kind: "asc" }, { name: "asc" }],
    }),
    prisma.financeTransaction.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      take: 100,
      include: { category: true },
    }),
  ]);

  const catOptions = categories.map((c) => ({
    id: c.id,
    name: c.name,
    kind: c.kind as FinanceKind,
  }));

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-sm font-semibold">Record a transaction</h2>
        {catOptions.length === 0 && (
          <p className="mb-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            Tip: add{" "}
            <Link href="/admin/finance/categories" className="text-primary hover:underline">
              categories
            </Link>{" "}
            first to group and budget your entries. You can still record uncategorised entries now.
          </p>
        )}
        <TransactionForm categories={catOptions} />
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <h2 className="text-sm font-semibold">Ledger</h2>
          <div className="flex gap-1">
            {FILTERS.map((f) => {
              const active = (activeKind ?? "") === f.key;
              const href = f.key ? `/admin/finance/transactions?kind=${f.key}` : "/admin/finance/transactions";
              return (
                <Link
                  key={f.key || "all"}
                  href={href}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No transactions {activeKind ? `of type "${KIND_LABELS[activeKind]}"` : "yet"}.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(t.occurredAt.toISOString())}
                  </TableCell>
                  <TableCell className="font-medium">
                    {t.description}
                    {t.reference && (
                      <span className="ml-2 text-xs text-muted-foreground">#{t.reference}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.category ? (
                      t.category.name
                    ) : (
                      <Badge variant="muted">Uncategorised</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.method ? METHOD_LABELS[t.method as FinanceMethod] ?? t.method : "—"}
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      t.kind === "income" ? "text-emerald-600" : "text-destructive"
                    }`}
                  >
                    {t.kind === "income" ? "+" : "−"}
                    {formatNGN(t.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DeleteButton
                      id={t.id}
                      action={deleteTransaction}
                      confirmText={`Delete this ${KIND_LABELS[t.kind as FinanceKind].toLowerCase()} entry?`}
                    />
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

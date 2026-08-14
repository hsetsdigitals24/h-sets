/**
 * Shared constants, types, and helpers for the Finance module
 * (/admin/finance). Kept dependency-free so it can be imported from both
 * server and client components. All amounts are whole Nigerian Naira (Int).
 */

export const FINANCE_KINDS = ["income", "expense"] as const;
export type FinanceKind = (typeof FINANCE_KINDS)[number];

export const KIND_LABELS: Record<FinanceKind, string> = {
  income: "Revenue",
  expense: "Expenditure",
};

/** Payment/settlement methods offered when recording a transaction. */
export const FINANCE_METHODS = [
  "bank",
  "cash",
  "card",
  "paystack",
  "flutterwave",
  "transfer",
  "other",
] as const;
export type FinanceMethod = (typeof FINANCE_METHODS)[number];

export const METHOD_LABELS: Record<FinanceMethod, string> = {
  bank: "Bank",
  cash: "Cash",
  card: "Card",
  paystack: "Paystack",
  flutterwave: "Flutterwave",
  transfer: "Transfer",
  other: "Other",
};

export function isFinanceKind(v: unknown): v is FinanceKind {
  return typeof v === "string" && (FINANCE_KINDS as readonly string[]).includes(v);
}

export function isFinanceMethod(v: unknown): v is FinanceMethod {
  return typeof v === "string" && (FINANCE_METHODS as readonly string[]).includes(v);
}

/** Net position = revenue − expenditure. */
export function netAmount(income: number, expense: number): number {
  return income - expense;
}

/**
 * Parse a user-entered amount into whole naira. Accepts "1,200,000",
 * "1200000", "₦1200000" etc. Returns null when not a positive whole number.
 */
export function parseAmount(raw: unknown): number | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const cleaned = String(raw).replace(/[₦,\s]/g, "").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

/** First and last instant of the calendar month containing `d` (UTC-safe). */
export function monthRange(d = new Date()): { start: Date; end: Date } {
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { start, end };
}

/** yyyy-mm-dd for prefilling <input type="date">. */
export function toDateInput(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** A short period label like "Aug 2026" or "Aug – Oct 2026". */
export function periodLabel(start: Date, end: Date): string {
  const fmt = (x: Date) =>
    x.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
  const a = fmt(start);
  const b = fmt(end);
  return a === b ? a : `${a} – ${b}`;
}

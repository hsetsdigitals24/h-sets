"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { isFinanceKind, isFinanceMethod, parseAmount } from "@/lib/finance";

const FINANCE = "/admin/finance";

function refresh() {
  revalidatePath(FINANCE);
  revalidatePath(`${FINANCE}/transactions`);
  revalidatePath(`${FINANCE}/categories`);
  revalidatePath(`${FINANCE}/budgets`);
}

type Result = { error?: string } | void;

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function createCategory(formData: FormData): Promise<Result> {
  await requireSection("finance");
  const name = String(formData.get("name") ?? "").trim();
  const kind = formData.get("kind");
  if (!name) return { error: "Category name is required." };
  if (name.length > 60) return { error: "Category name is too long." };
  if (!isFinanceKind(kind)) return { error: "Choose revenue or expenditure." };

  try {
    await prisma.financeCategory.create({ data: { name, kind } });
  } catch {
    return { error: "A category with that name already exists on that side." };
  }
  refresh();
}

// Returns void so it can be used directly as a native <form action>.
export async function archiveCategory(formData: FormData): Promise<void> {
  await requireSection("finance");
  const id = String(formData.get("id") ?? "");
  const archived = formData.get("archived") === "true";
  if (!id) return;
  await prisma.financeCategory.update({ where: { id }, data: { archived } });
  refresh();
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export async function createTransaction(formData: FormData): Promise<Result> {
  const user = await requireSection("finance");

  const kind = formData.get("kind");
  if (!isFinanceKind(kind)) return { error: "Choose revenue or expenditure." };

  const amount = parseAmount(formData.get("amount"));
  if (amount === null) return { error: "Enter a valid amount greater than zero." };

  const description = String(formData.get("description") ?? "").trim();
  if (!description) return { error: "A short description is required." };

  const dateRaw = String(formData.get("occurredAt") ?? "").trim();
  const occurredAt = dateRaw ? new Date(dateRaw) : new Date();
  if (Number.isNaN(occurredAt.getTime())) return { error: "Enter a valid date." };

  const methodRaw = formData.get("method");
  const method = isFinanceMethod(methodRaw) ? methodRaw : null;
  const reference = String(formData.get("reference") ?? "").trim() || null;

  // Validate the category belongs to the same side as the transaction.
  const categoryId = String(formData.get("categoryId") ?? "").trim() || null;
  if (categoryId) {
    const cat = await prisma.financeCategory.findUnique({ where: { id: categoryId } });
    if (!cat) return { error: "Selected category no longer exists." };
    if (cat.kind !== kind) return { error: "Category does not match the entry type." };
  }

  await prisma.financeTransaction.create({
    data: {
      kind,
      amount,
      description,
      occurredAt,
      method,
      reference,
      categoryId,
      createdById: user.id,
    },
  });
  refresh();
}

export async function deleteTransaction(formData: FormData): Promise<Result> {
  await requireSection("finance");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing entry." };
  await prisma.financeTransaction.delete({ where: { id } });
  refresh();
}

// ---------------------------------------------------------------------------
// Budgets
// ---------------------------------------------------------------------------

export async function createBudget(formData: FormData): Promise<Result> {
  await requireSection("finance");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Budget name is required." };

  const startRaw = String(formData.get("periodStart") ?? "").trim();
  const endRaw = String(formData.get("periodEnd") ?? "").trim();
  const periodStart = new Date(startRaw);
  const periodEnd = new Date(endRaw);
  if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
    return { error: "Enter a valid start and end date." };
  }
  if (periodEnd < periodStart) return { error: "End date must be after the start date." };

  // Push the end to the last instant of its day so same-day transactions count.
  periodEnd.setUTCHours(23, 59, 59, 999);

  const note = String(formData.get("note") ?? "").trim() || null;
  await prisma.budget.create({ data: { name, periodStart, periodEnd, note } });
  revalidatePath(`${FINANCE}/budgets`);
}

export async function deleteBudget(formData: FormData): Promise<Result> {
  await requireSection("finance");
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing budget." };
  await prisma.budget.delete({ where: { id } });
  revalidatePath(`${FINANCE}/budgets`);
}

/**
 * Set (or clear) the planned amount for one category within a budget. A planned
 * value of 0 or blank removes the line, so the budget only carries lines the
 * user has actually planned.
 */
export async function setBudgetLine(formData: FormData): Promise<Result> {
  await requireSection("finance");
  const budgetId = String(formData.get("budgetId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!budgetId || !categoryId) return { error: "Missing budget or category." };

  const raw = String(formData.get("planned") ?? "").trim();
  const planned = raw === "" ? 0 : parseAmount(raw);
  if (planned === null) return { error: "Enter a valid planned amount." };

  if (planned === 0) {
    await prisma.budgetLine.deleteMany({ where: { budgetId, categoryId } });
  } else {
    await prisma.budgetLine.upsert({
      where: { budgetId_categoryId: { budgetId, categoryId } },
      create: { budgetId, categoryId, planned },
      update: { planned },
    });
  }
  revalidatePath(`${FINANCE}/budgets/${budgetId}`);
}

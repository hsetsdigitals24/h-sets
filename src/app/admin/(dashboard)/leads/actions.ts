"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { LEAD_STATUSES } from "@/lib/leads";

export type LeadActionState = { ok?: boolean; error?: string };

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(LEAD_STATUSES),
  score: z.coerce.number().int().min(0).max(100),
  notes: z.string().max(5000).optional(),
});

export async function updateLead(
  _prev: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  await requireSection("leads");

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    score: formData.get("score"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { error: "Please check the values and try again." };
  }

  const { id, status, score, notes } = parsed.data;
  await prisma.lead.update({
    where: { id: BigInt(id) },
    data: { status, score, notes: notes || null },
  });

  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteLead(formData: FormData) {
  await requireSection("leads");
  const id = formData.get("id");
  if (typeof id !== "string") return;
  await prisma.lead.delete({ where: { id: BigInt(id) } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  redirect("/admin/leads");
}

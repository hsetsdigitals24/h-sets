"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { LEAD_STATUSES, LEAD_TYPES, STATUS_LABELS } from "@/lib/leads";
import { tierForScore } from "@/lib/lead-scoring";
import { logLeadEvent } from "@/lib/lead-events";
import { createNotification } from "@/lib/notifications";

export type LeadActionState = { ok?: boolean; error?: string };

const createSchema = z.object({
  type: z.enum(LEAD_TYPES),
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  source: z.string().max(200).optional(),
  status: z.enum(LEAD_STATUSES).default("new"),
  score: z.coerce.number().int().min(0).max(100).default(0),
  notes: z.string().max(5000).optional(),
});

export async function createLead(
  _prev: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const admin = await requireSection("leads");

  const parsed = createSchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    company: formData.get("company") ?? "",
    source: formData.get("source") ?? "",
    status: formData.get("status") ?? "new",
    score: formData.get("score") ?? 0,
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { error: "Please check the values and try again." };
  }

  const { type, name, email, phone, company, source, status, score, notes } = parsed.data;
  const tier = tierForScore(score);
  const sourceValue = source || "manual";

  const lead = await prisma.lead.create({
    data: {
      type,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      source: sourceValue,
      status,
      score,
      tier,
      notes: notes || null,
    },
    select: { id: true },
  });

  // Seed the activity timeline so the detail page mirrors captured leads.
  await logLeadEvent(lead.id, {
    type: "created",
    message: `Lead added manually by ${admin.name} (score ${score}, ${tier}).`,
    meta: { score, tier, source: sourceValue, manual: true },
    actorId: admin.id,
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}

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
  const admin = await requireSection("leads");

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
  const notesValue = notes || null;

  const before = await prisma.lead.findUnique({
    where: { id: BigInt(id) },
    select: { status: true, score: true, notes: true },
  });
  if (!before) return { error: "Lead not found." };

  const tier = tierForScore(score);
  await prisma.lead.update({
    where: { id: BigInt(id) },
    data: { status, score, tier, notes: notesValue },
  });

  // Log each meaningful change to the activity timeline.
  if (before.status !== status) {
    await logLeadEvent(BigInt(id), {
      type: "status_changed",
      message: `Status changed from ${STATUS_LABELS[before.status as keyof typeof STATUS_LABELS] ?? before.status} to ${STATUS_LABELS[status]}.`,
      meta: { from: before.status, to: status },
      actorId: admin.id,
    });
  }
  if (before.score !== score) {
    await logLeadEvent(BigInt(id), {
      type: "score_changed",
      message: `Score changed from ${before.score} to ${score} (${tier}).`,
      meta: { from: before.score, to: score, tier },
      actorId: admin.id,
    });
  }
  if ((before.notes ?? "") !== (notesValue ?? "")) {
    await logLeadEvent(BigInt(id), {
      type: "note_added",
      message: "Notes updated.",
      actorId: admin.id,
    });
  }

  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}

const assignSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string(), // "" clears the assignment
});

export async function assignLead(
  _prev: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const admin = await requireSection("leads");

  const parsed = assignSchema.safeParse({
    id: formData.get("id"),
    ownerId: formData.get("ownerId") ?? "",
  });
  if (!parsed.success) return { error: "Invalid assignment." };

  const { id, ownerId } = parsed.data;
  const owner = ownerId
    ? await prisma.user.findUnique({
        where: { id: ownerId },
        select: { id: true, name: true },
      })
    : null;
  if (ownerId && !owner) return { error: "That team member no longer exists." };

  await prisma.lead.update({
    where: { id: BigInt(id) },
    data: {
      ownerId: owner?.id ?? null,
      assignedAt: owner ? new Date() : null,
    },
  });

  await logLeadEvent(BigInt(id), {
    type: "assigned",
    message: owner ? `Assigned to ${owner.name}.` : "Assignment cleared.",
    meta: { ownerId: owner?.id ?? null },
    actorId: admin.id,
  });

  // Notify the new owner (unless they assigned it to themselves).
  if (owner && owner.id !== admin.id) {
    await createNotification(owner.id, {
      type: "lead",
      title: "A lead was assigned to you",
      body: "Open the CRM to follow up.",
      link: `/admin/leads/${id}`,
    });
  }

  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
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

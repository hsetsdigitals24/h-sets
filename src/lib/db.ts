import "server-only";
import { prisma } from "./prisma";
import { scoreLead, tierForScore, type LeadTier } from "./lead-scoring";
import { logLeadEvent } from "./lead-events";
import { enrollInNurture, sequenceForLead } from "./nurture";
import { notifyRole } from "./notifications";

/**
 * Lead persistence.
 *
 * The public marketing forms (contact, consultation, newsletter, resource)
 * funnel here. Storage is Postgres via Prisma (see prisma/schema.prisma — the
 * `Lead` model maps onto the `leads` table). The admin CRM reads/updates the
 * same table.
 *
 * This is the single capture chokepoint, so it also owns the automatic
 * lead-scoring, temperature tiering, activity-log seeding, nurture enrollment,
 * and urgent-lead alerting — all best-effort so they never block the caller.
 */

export type LeadType = "contact" | "consultation" | "newsletter" | "resource";

export type LeadRecord = {
  type: LeadType;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  source?: string | null;
  data?: Record<string, unknown>;
};

/** Insert a lead/submission and return its new id, timestamp and tier. */
export async function insertLead(
  lead: LeadRecord
): Promise<{ id: number; created_at: string; score: number; tier: LeadTier }> {
  const score = scoreLead(lead);
  const tier = tierForScore(score);

  const row = await prisma.lead.create({
    data: {
      type: lead.type,
      name: lead.name ?? null,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      company: lead.company ?? null,
      source: lead.source ?? null,
      data: (lead.data ?? {}) as object,
      score,
      tier,
    },
    select: { id: true, createdAt: true },
  });
  // Callers serialize `id` into JSON responses; keep it a plain number.
  const id = Number(row.id);

  // Post-capture side effects — best-effort, never block the response.
  await logLeadEvent(row.id, {
    type: "created",
    message: `Lead captured via ${lead.source ?? lead.type} (score ${score}, ${tier}).`,
    meta: { score, tier, source: lead.source ?? null },
  });

  const sequence = sequenceForLead(lead);
  if (sequence) await enrollInNurture(row.id, sequence);

  if (tier === "urgent") {
    await notifyRole("SALES_ADMIN", {
      type: "lead",
      title: `Urgent lead — contact today`,
      body: `${lead.name ?? "A new lead"} scored ${score} (${tier}). Reach out same-day.`,
      link: `/admin/leads/${id}`,
    });
  }

  return { id, created_at: row.createdAt.toISOString(), score, tier };
}

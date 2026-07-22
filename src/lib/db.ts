import "server-only";
import { prisma } from "./prisma";

/**
 * Lead persistence.
 *
 * The public marketing forms (contact, consultation, newsletter, resource)
 * funnel here. Storage is Postgres via Prisma (see prisma/schema.prisma — the
 * `Lead` model maps onto the `leads` table). The admin CRM reads/updates the
 * same table.
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

/** Insert a lead/submission and return its new id + timestamp. */
export async function insertLead(
  lead: LeadRecord
): Promise<{ id: number; created_at: string }> {
  const row = await prisma.lead.create({
    data: {
      type: lead.type,
      name: lead.name ?? null,
      email: lead.email ?? null,
      phone: lead.phone ?? null,
      company: lead.company ?? null,
      source: lead.source ?? null,
      data: (lead.data ?? {}) as object,
    },
    select: { id: true, createdAt: true },
  });
  // Callers serialize `id` into JSON responses; keep it a plain number.
  return { id: Number(row.id), created_at: row.createdAt.toISOString() };
}

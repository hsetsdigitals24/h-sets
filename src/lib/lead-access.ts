import type { Prisma, Role } from "@prisma/client";
import { notFound } from "next/navigation";
import { prisma } from "./prisma";
import { requireSection } from "./auth";

/**
 * Lead visibility rules.
 *
 * Only super admins see the whole CRM. Every other role with the `leads`
 * section (business development, and anyone granted it via a per-user
 * override) sees a private book: the leads assigned to them. Leads they add
 * manually are auto-assigned to them so they never create an invisible record.
 */
export function canSeeAllLeads(role: Role): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * The ownership clause to merge into every lead query. Empty for super admins,
 * `ownerId = self` for everyone else.
 */
export function leadScopeWhere(user: { id: string; role: Role }): Prisma.LeadWhereInput {
  return canSeeAllLeads(user.role) ? {} : { ownerId: user.id };
}

/**
 * Guards the leads section and returns the user plus their visibility scope.
 * Use the returned `where` as the base of any lead query.
 */
export async function requireLeadsAccess() {
  const user = await requireSection("leads");
  return {
    user,
    seesAll: canSeeAllLeads(user.role),
    where: leadScopeWhere(user),
  };
}

/**
 * Guards a single lead by id. A lead outside the user's scope is reported as
 * missing rather than forbidden, so ids can't be probed for existence.
 */
export async function requireOwnedLead(user: { id: string; role: Role }, id: bigint) {
  const lead = await prisma.lead.findFirst({
    where: { id, ...leadScopeWhere(user) },
    select: { id: true },
  });
  if (!lead) notFound();
  return lead;
}

/** Same check for server actions, which return an error rather than a 404. */
export async function assertOwnedLead(
  user: { id: string; role: Role },
  id: bigint
): Promise<boolean> {
  if (canSeeAllLeads(user.role)) return true;
  const lead = await prisma.lead.findFirst({
    where: { id, ownerId: user.id },
    select: { id: true },
  });
  return Boolean(lead);
}

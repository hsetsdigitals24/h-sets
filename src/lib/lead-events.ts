// Lead activity timeline. Server-only.
//
// Append-only audit of what happened to a lead (capture, status/score changes,
// assignment, nurture sends). All writes are best-effort: a failure here must
// never break the primary action (mirrors src/lib/notifications.ts).

import "server-only";
import { prisma } from "@/lib/prisma";

export type LeadEventType =
  | "created"
  | "status_changed"
  | "assigned"
  | "score_changed"
  | "note_added"
  | "nurture_sent";

export type LeadEventInput = {
  type: LeadEventType;
  message: string;
  meta?: Record<string, unknown>;
  actorId?: string | null;
};

/** Record one timeline event for a lead. Best-effort. */
export async function logLeadEvent(
  leadId: bigint | number,
  event: LeadEventInput
): Promise<void> {
  try {
    await prisma.leadEvent.create({
      data: {
        leadId: BigInt(leadId),
        type: event.type,
        message: event.message,
        meta: (event.meta ?? {}) as object,
        actorId: event.actorId ?? null,
      },
    });
  } catch (err) {
    console.error("[lead-events] logLeadEvent failed:", err);
  }
}

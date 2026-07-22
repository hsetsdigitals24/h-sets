/**
 * Lead scoring & temperature tiers.
 *
 * Pure, dependency-free logic (no I/O, no server-only) so it can run at capture
 * time (src/lib/db.ts insertLead), in the backfill script, and be imported by
 * both server and client components for tier labels/badges.
 *
 * The point model mirrors the PRD §15.2 lead-scoring table, mapped onto the
 * signals we actually have at capture time (lead type + source + form data).
 * Thresholds follow the PRD §15.2 bands: Cold 0–20, Warm 21–50, Hot 51–80,
 * Urgent 81+.
 */

export const TIERS = ["cold", "warm", "hot", "urgent"] as const;
export type LeadTier = (typeof TIERS)[number];

export const TIER_LABELS: Record<LeadTier, string> = {
  cold: "Cold",
  warm: "Warm",
  hot: "Hot",
  urgent: "Urgent",
};

/** Badge variant per tier, matching the badge.tsx variants. */
export const TIER_VARIANT: Record<
  LeadTier,
  "default" | "muted" | "success" | "outline" | "accent"
> = {
  cold: "muted",
  warm: "outline",
  hot: "accent",
  urgent: "success",
};

/**
 * Points awarded per lead type. These are the base signals; `scoreLead` layers
 * a few data-driven bonuses on top. Kept as a tunable constant for clarity.
 */
export const TYPE_POINTS = {
  consultation: 40, // highest intent — a booked call (PRD: consultation +40)
  contact: 15, // general inbound enquiry
  resource: 10, // gated content download — early awareness (PRD: checklist/template +10)
  newsletter: 5, // lowest intent — awareness signup
} as const;

type ScoreInput = {
  type: string;
  source?: string | null;
  data?: Record<string, unknown> | null;
};

/** Heuristic: does this contact enquiry look like a corporate-training request? */
function looksCorporate(data: Record<string, unknown>): boolean {
  const haystack = [data.topic, data.message, data.company]
    .filter((v) => typeof v === "string")
    .join(" ")
    .toLowerCase();
  return /\bcorporate\b|\btraining\b|\bteam\b|\bstaff\b|\bemployee/.test(haystack);
}

/** Compute a 0–100 lead score from the signals available at capture. */
export function scoreLead(input: ScoreInput): number {
  const data = (input.data ?? {}) as Record<string, unknown>;
  let score: number = TYPE_POINTS[input.type as keyof typeof TYPE_POINTS] ?? 0;

  switch (input.type) {
    case "contact":
      // Corporate training enquiries are high-value B2B intent (PRD: +35).
      if (looksCorporate(data)) score = 35;
      break;
    case "resource":
      // A full-gate download (phone captured) signals a hotter, higher-value
      // lead than an email-only checklist grab (PRD: report/whitepaper +20).
      if (typeof data.phone === "string" && data.phone.trim() !== "") score += 10;
      break;
    case "consultation":
      // Longer strategy/AI sessions indicate deeper intent.
      if (typeof data.session === "string" && /strategy|ai/i.test(data.session)) {
        score += 5;
      }
      break;
  }

  return Math.max(0, Math.min(100, score));
}

/** Map a numeric score onto a temperature tier (PRD §15.2 bands). */
export function tierForScore(score: number): LeadTier {
  if (score >= 81) return "urgent";
  if (score >= 51) return "hot";
  if (score >= 21) return "warm";
  return "cold";
}

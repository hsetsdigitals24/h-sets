// Temperature tiers live in lead-scoring.ts (pure logic). Re-exported here so
// the admin UI can import tier + status constants from one place.
export {
  TIERS,
  TIER_LABELS,
  TIER_VARIANT,
  type LeadTier,
} from "./lead-scoring";

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_TYPES = [
  "contact",
  "consultation",
  "newsletter",
  "resource",
] as const;

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

/** Badge variant per status, matching the badge.tsx variants. */
export const STATUS_VARIANT: Record<
  LeadStatus,
  "default" | "muted" | "success" | "outline" | "accent"
> = {
  new: "default",
  contacted: "accent",
  qualified: "outline",
  won: "success",
  lost: "muted",
};

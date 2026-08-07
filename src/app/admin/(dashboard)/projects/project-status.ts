import type { ProjectStatus } from "@prisma/client";
import type { BadgeProps } from "@/components/ui/badge";

/**
 * Display metadata for a project's lifecycle status. `ORDER` is the canonical
 * ordering used to group and sort projects on the list page (active work first,
 * archived last).
 */
export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; badge: NonNullable<BadgeProps["variant"]> }
> = {
  ACTIVE: { label: "Active", badge: "success" },
  IN_PROGRESS: { label: "In progress", badge: "default" },
  COMPLETED: { label: "Completed", badge: "accent" },
  ARCHIVED: { label: "Archived", badge: "muted" },
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "ACTIVE",
  "IN_PROGRESS",
  "COMPLETED",
  "ARCHIVED",
];

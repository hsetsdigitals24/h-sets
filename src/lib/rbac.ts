import type { Role } from "@prisma/client";

/**
 * Role-based access control for the admin dashboard.
 *
 * Kept dependency-free (type-only Prisma import) so it can be imported from
 * both server components and client components (e.g. the sidebar).
 * SUPER_ADMIN implicitly has access to everything.
 */

export type AdminSection =
  | "dashboard"
  | "leads"
  | "cohorts"
  | "instructors"
  | "jobs"
  | "job-applications"
  | "insights"
  | "resources"
  | "testimonials"
  | "portfolio"
  | "applications"
  | "enrollments"
  | "learning"
  | "grading"
  | "exams"
  | "attendance"
  | "certificates"
  | "notifications"
  | "users";

/** Roles allowed per section. "all" = any authenticated admin. [] = SUPER_ADMIN only. */
const SECTION_ROLES: Record<AdminSection, Role[] | "all"> = {
  dashboard: "all",
  leads: ["SALES_ADMIN"],
  cohorts: ["ACADEMY_ADMIN"],
  instructors: ["ACADEMY_ADMIN"],
  jobs: ["ACADEMY_ADMIN"],
  "job-applications": ["ACADEMY_ADMIN"],
  insights: ["MARKETING_ADMIN"],
  resources: ["MARKETING_ADMIN"],
  testimonials: ["MARKETING_ADMIN"],
  portfolio: ["MARKETING_ADMIN"],
  applications: ["ACADEMY_ADMIN"],
  enrollments: ["ACADEMY_ADMIN"],
  learning: ["ACADEMY_ADMIN", "INSTRUCTOR"],
  grading: ["ACADEMY_ADMIN", "INSTRUCTOR"],
  exams: ["ACADEMY_ADMIN", "INSTRUCTOR"],
  attendance: ["ACADEMY_ADMIN", "INSTRUCTOR"],
  certificates: ["ACADEMY_ADMIN"],
  // Every admin can open the notifications page to read their own list.
  // Broadcasting is gated separately (see BROADCAST_ROLES below).
  notifications: "all",
  users: [],
};

/** Roles allowed to broadcast announcements. SUPER_ADMIN always passes. */
export const BROADCAST_ROLES: Role[] = ["MARKETING_ADMIN"];

export function canBroadcast(role: Role): boolean {
  return role === "SUPER_ADMIN" || BROADCAST_ROLES.includes(role);
}

export function canAccess(role: Role, section: AdminSection): boolean {
  if (role === "SUPER_ADMIN") return true;
  const allowed = SECTION_ROLES[section];
  if (allowed === "all") return true;
  return allowed.includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ACADEMY_ADMIN: "Academy Admin",
  MARKETING_ADMIN: "Marketing Admin",
  SALES_ADMIN: "Sales Admin",
  FINANCE_ADMIN: "Finance Admin",
  INSTRUCTOR: "Instructor",
  STUDENT: "Student",
};

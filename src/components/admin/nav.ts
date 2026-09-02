import {
  LayoutDashboard,
  GraduationCap,
  Inbox,
  CalendarDays,
  UserCog,
  Briefcase,
  Newspaper,
  FileDown,
  Quote,
  FolderKanban,
  Users,
  UserPlus,
  ClipboardList,
  BookOpen,
  ClipboardCheck,
  FileCheck2,
  CalendarCheck,
  Award,
  Bell,
  KanbanSquare,
  Video,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { AdminSection } from "@/lib/rbac";

export const NAV_GROUPS = [
  "Overview",
  "Academy",
  "Careers",
  "Marketing",
  "Business Developer",
  "Finance",
  "Administration",
] as const;

export type NavGroup = (typeof NAV_GROUPS)[number];

export type NavItem = {
  section: AdminSection;
  group: NavGroup;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { group: "Overview", section: "dashboard", label: "Overview", href: "/admin", icon: LayoutDashboard },

  { group: "Academy", section: "cohorts", label: "Cohorts", href: "/admin/cohorts", icon: CalendarDays },
  { group: "Academy", section: "instructors", label: "Instructors", href: "/admin/instructors", icon: UserCog },
  { group: "Academy", section: "applications", label: "Applications", href: "/admin/applications", icon: ClipboardList },
  { group: "Academy", section: "enrollments", label: "Enrollments", href: "/admin/enrollments", icon: UserPlus },
  { group: "Academy", section: "learning", label: "Learning Content", href: "/admin/learning", icon: BookOpen },
  { group: "Academy", section: "grading", label: "Assignments", href: "/admin/grading", icon: ClipboardCheck },
  { group: "Academy", section: "exams", label: "Exams (CBT)", href: "/admin/exams", icon: FileCheck2 },
  { group: "Academy", section: "attendance", label: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
  { group: "Academy", section: "certificates", label: "Certificates", href: "/admin/certificates", icon: Award },

  { group: "Careers", section: "jobs", label: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { group: "Careers", section: "job-applications", label: "Job Applications", href: "/admin/job-applications", icon: ClipboardList },

  { group: "Marketing", section: "insights", label: "Insights", href: "/admin/insights", icon: Newspaper },
  { group: "Marketing", section: "resources", label: "Resources", href: "/admin/resources", icon: FileDown },
  { group: "Marketing", section: "testimonials", label: "Testimonials", href: "/admin/testimonials", icon: Quote },
  { group: "Marketing", section: "portfolio", label: "Portfolio", href: "/admin/portfolio", icon: FolderKanban },

  { group: "Business Developer", section: "leads", label: "Leads / CRM", href: "/admin/leads", icon: Inbox },

  { group: "Finance", section: "finance", label: "Finance", href: "/admin/finance", icon: Wallet },

  { group: "Administration", section: "projects", label: "Project Management", href: "/admin/projects", icon: KanbanSquare },
  { group: "Administration", section: "standups", label: "Standups", href: "/admin/standups", icon: Video },
  { group: "Administration", section: "notifications", label: "Notifications", href: "/admin/notifications", icon: Bell },
  { group: "Administration", section: "users", label: "Team & Roles", href: "/admin/users", icon: Users },
];

/**
 * Presentation metadata for each navigation group. Groups are the top-level
 * "sections" surfaced as tiles on the dashboard landing page and as the scope
 * of the contextual sidebar. `slug` is the URL segment used by the section
 * overview route (`/admin/section/[slug]`).
 */
/**
 * A vibrant, self-contained colour theme for a section. `primary` is the solid
 * brand colour (used for the landing card and rebound to the `--primary` token
 * within the section); `accent` is a lighter companion tone. Foregrounds are
 * the readable text colour on top of each.
 */
export type GroupTheme = {
  primary: string;
  primaryForeground: string;
  accent: string;
  accentForeground: string;
};

export type NavGroupMeta = {
  slug: string;
  icon: LucideIcon;
  description: string;
  theme: GroupTheme;
};

export const NAV_GROUP_META: Record<NavGroup, NavGroupMeta> = {
  Overview: {
    slug: "overview",
    icon: LayoutDashboard,
    description: "A snapshot of your platform activity.",
    theme: {
      primary: "#475569",
      primaryForeground: "#ffffff",
      accent: "#94a3b8",
      accentForeground: "#0b1020",
    },
  },
  Academy: {
    slug: "academy",
    icon: GraduationCap,
    description: "Cohorts, instructors, enrollments, learning, grading & certificates.",
    theme: {
      primary: "#7c3aed",
      primaryForeground: "#ffffff",
      accent: "#a78bfa",
      accentForeground: "#0b1020",
    },
  },
  Careers: {
    slug: "careers",
    icon: Briefcase,
    description: "Job listings and candidate applications.",
    theme: {
      primary: "#059669",
      primaryForeground: "#ffffff",
      accent: "#34d399",
      accentForeground: "#0b1020",
    },
  },
  Marketing: {
    slug: "marketing",
    icon: Newspaper,
    description: "Insights, resources, testimonials & portfolio.",
    theme: {
      primary: "#f97316",
      primaryForeground: "#ffffff",
      accent: "#fdba74",
      accentForeground: "#0b1020",
    },
  },
  "Business Developer": {
    slug: "sales",
    icon: Inbox,
    description: "Leads and CRM pipeline.",
    theme: {
      primary: "#e11d48",
      primaryForeground: "#ffffff",
      accent: "#fb7185",
      accentForeground: "#0b1020",
    },
  },
  Finance: {
    slug: "finance",
    icon: Wallet,
    description: "Revenue, expenditure and budgets.",
    theme: {
      primary: "#0891b2",
      primaryForeground: "#ffffff",
      accent: "#22d3ee",
      accentForeground: "#0b1020",
    },
  },
  Administration: {
    slug: "administration",
    icon: Users,
    description: "Projects, standups, notifications & team roles.",
    theme: {
      primary: "#4f46e5",
      primaryForeground: "#ffffff",
      accent: "#818cf8",
      accentForeground: "#0b1020",
    },
  },
};

const GROUP_BY_SLUG = new Map<string, NavGroup>(
  (Object.entries(NAV_GROUP_META) as [NavGroup, NavGroupMeta][]).map(
    ([group, meta]) => [meta.slug, group]
  )
);

/** Resolve a URL slug back to its navigation group, if valid. */
export function groupBySlug(slug: string): NavGroup | undefined {
  return GROUP_BY_SLUG.get(slug);
}

/** The URL slug for a group's section overview page. */
export function slugForGroup(group: NavGroup): string {
  return NAV_GROUP_META[group].slug;
}

/** The nav items in a group that the given accessible sections permit. */
export function itemsForGroup(
  group: NavGroup,
  sections: AdminSection[]
): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => item.group === group && sections.includes(item.section)
  );
}

/**
 * The groups a user may access (has at least one permitted page in), excluding
 * the always-present "Overview" group which is the landing page itself. These
 * become the role-based tiles on the dashboard landing page.
 */
export function accessibleGroups(sections: AdminSection[]): NavGroup[] {
  return NAV_GROUPS.filter(
    (group) =>
      group !== "Overview" &&
      NAV_ITEMS.some(
        (item) => item.group === group && sections.includes(item.section)
      )
  );
}

/**
 * Determine which group the current pathname belongs to, for scoping the
 * contextual sidebar. Handles both the section overview route
 * (`/admin/section/[slug]`) and the flat page routes (`/admin/cohorts`, …).
 * Returns `null` on the landing page (`/admin`) and unknown paths.
 */
export function groupForPath(pathname: string): NavGroup | null {
  const sectionMatch = pathname.match(/^\/admin\/section\/([^/]+)/);
  if (sectionMatch) return groupBySlug(sectionMatch[1]) ?? null;

  const match = NAV_ITEMS.filter(
    (item) => item.href !== "/admin" && pathname.startsWith(item.href)
  ).sort((a, b) => b.href.length - a.href.length)[0];

  return match?.group ?? null;
}

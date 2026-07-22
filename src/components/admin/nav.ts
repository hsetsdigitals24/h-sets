import {
  LayoutDashboard,
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
  type LucideIcon,
} from "lucide-react";
import type { AdminSection } from "@/lib/rbac";

export const NAV_GROUPS = [
  "Overview",
  "Academy",
  "Careers",
  "Marketing",
  "Sales",
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

  { group: "Sales", section: "leads", label: "Leads / CRM", href: "/admin/leads", icon: Inbox },

  { group: "Administration", section: "notifications", label: "Notifications", href: "/admin/notifications", icon: Bell },
  { group: "Administration", section: "users", label: "Team & Roles", href: "/admin/users", icon: Users },
];

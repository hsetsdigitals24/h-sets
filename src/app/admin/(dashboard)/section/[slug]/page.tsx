import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Inbox,
  CalendarDays,
  ClipboardList,
  UserPlus,
  Briefcase,
  Newspaper,
  FileDown,
  Quote,
  Wallet,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { requireUser, getAllowedSections } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeading } from "@/components/admin/page-heading";
import { StatCard } from "@/components/admin/stat-card";
import {
  NAV_GROUP_META,
  groupBySlug,
  itemsForGroup,
  type NavGroup,
} from "@/components/admin/nav";

export const dynamic = "force-dynamic";

type Stat = { label: string; value: number; icon: LucideIcon };

/** Quick counters relevant to a section, shown at the top of its overview. */
async function getGroupStats(group: NavGroup): Promise<Stat[]> {
  switch (group) {
    case "Academy": {
      const [cohorts, pendingApplications, enrollments] = await Promise.all([
        prisma.cohort.count(),
        prisma.application.count({ where: { status: "pending" } }),
        prisma.enrollment.count(),
      ]);
      return [
        { label: "Cohorts", value: cohorts, icon: CalendarDays },
        { label: "Pending applications", value: pendingApplications, icon: ClipboardList },
        { label: "Enrollments", value: enrollments, icon: UserPlus },
      ];
    }
    case "Careers": {
      const [jobs, jobApplications] = await Promise.all([
        prisma.job.count(),
        prisma.jobApplication.count(),
      ]);
      return [
        { label: "Jobs", value: jobs, icon: Briefcase },
        { label: "Job applications", value: jobApplications, icon: ClipboardList },
      ];
    }
    case "Marketing": {
      const [insights, resources, testimonials] = await Promise.all([
        prisma.insight.count(),
        prisma.resource.count(),
        prisma.testimonial.count(),
      ]);
      return [
        { label: "Insights", value: insights, icon: Newspaper },
        { label: "Resources", value: resources, icon: FileDown },
        { label: "Testimonials", value: testimonials, icon: Quote },
      ];
    }
    case "Business Development": {
      const [newLeads, totalLeads] = await Promise.all([
        prisma.lead.count({ where: { status: "new" } }),
        prisma.lead.count(),
      ]);
      return [
        { label: "New leads", value: newLeads, icon: Inbox },
        { label: "Total leads", value: totalLeads, icon: Inbox },
      ];
    }
    case "Finance": {
      const [transactions, budgets] = await Promise.all([
        prisma.financeTransaction.count(),
        prisma.budget.count(),
      ]);
      return [
        { label: "Transactions", value: transactions, icon: Wallet },
        { label: "Budgets", value: budgets, icon: Wallet },
      ];
    }
    default:
      return [];
  }
}

export default async function SectionOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = groupBySlug(slug);
  if (!group || group === "Overview") redirect("/admin");

  const user = await requireUser();
  const sections = await getAllowedSections(user.id, user.role);
  const items = itemsForGroup(group, sections);

  // No accessible pages in this section for this user — send them home.
  if (items.length === 0) redirect("/admin");

  // Standalone groups have no overview — go straight to the page.
  if (NAV_GROUP_META[group].standalone) redirect(items[0].href);

  const stats = await getGroupStats(group);

  return (
    <div>
      <PageHeading
        title={group}
        description={NAV_GROUP_META[group].description}
        back={{ href: "/admin", label: "Dashboard" }}
      />

      {stats.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>
      )}
      
    </div>
  );
}

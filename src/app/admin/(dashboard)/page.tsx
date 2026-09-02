import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireUser, getAllowedSections } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import {
  NAV_GROUP_META,
  accessibleGroups,
  itemsForGroup,
} from "@/components/admin/nav";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const user = await requireUser();
  const sections = await getAllowedSections(user.id, user.role);
  const groups = accessibleGroups(sections);

  return (
    <div className="mx-auto w-full lg:w-[70%]">
      <PageHeading
        title={`Welcome${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Choose a section to get started."
      />

      {groups.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
          You don&apos;t have access to any sections yet. Contact a super admin
          to be granted access.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const meta = NAV_GROUP_META[group];
            const Icon = meta.icon;

            // Standalone groups are a single page: the card links straight to
            // that page (not a section overview) and carries its own colour.
            const href = meta.standalone
              ? itemsForGroup(group, sections)[0]?.href ?? "/admin"
              : `/admin/section/${meta.slug}`;

            return (
              <Link
                key={group}
                href={href}
                style={{ backgroundColor: meta.theme.primary }}
                className="group flex flex-col rounded-xl p-6 text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white/20 text-white">
                    <Icon className="size-5" />
                  </span>
                  <ArrowRight className="size-4 text-white/70 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                </div>
                <h2 className="mt-6 text-lg font-semibold tracking-tight">
                  {group}
                </h2>
                <p className="mt-2 flex-1 text-sm text-white/80">
                  {meta.description}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

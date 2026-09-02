"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import type { AdminSection } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import {
  NAV_GROUP_META,
  accessibleGroups,
  itemsForGroup,
  slugForGroup,
  type NavGroup,
} from "./nav";

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/**
 * The contextual, section-scoped navigation body: a "Dashboard" back link
 * followed by the pages belonging to a single group. Shared by the desktop
 * {@link Sidebar} and the mobile drawer. `onNavigate` lets the drawer close
 * itself when a link is tapped.
 */
export function SectionNav({
  group,
  sections,
  onNavigate,
}: {
  group: NavGroup;
  sections: AdminSection[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = itemsForGroup(group, sections);
  const meta = NAV_GROUP_META[group];
  const GroupIcon = meta.icon;
  const overviewHref = `/admin/section/${slugForGroup(group)}`;

  return (
    <>
      <nav className="flex-1 overflow-y-auto p-3">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Dashboard
        </Link>

        <Link
          href={overviewHref}
          onClick={onNavigate}
          className={cn(
            "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
            isActive(pathname, overviewHref)
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-secondary"
          )}
        >
          <GroupIcon className="size-4 shrink-0" />
          {group} overview
        </Link>

        <div className="mt-2 space-y-1">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to site
        </Link>
      </div>
    </>
  );
}

/**
 * A flat list of the section tiles as links. Used on the mobile drawer when
 * the user is on the landing page (which has no active section) so they can
 * still jump straight into any section.
 */
export function SectionListNav({
  sections,
  onNavigate,
}: {
  sections: AdminSection[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const groups = accessibleGroups(sections);

  return (
    <>
      <nav className="flex-1 overflow-y-auto p-3">
        <Link
          href="/admin"
          onClick={onNavigate}
          className={cn(
            "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/admin"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <LayoutGrid className="size-4 shrink-0" />
          Dashboard
        </Link>

        <div className="mt-2 space-y-1">
          {groups.map((group) => {
            const meta = NAV_GROUP_META[group];
            const Icon = meta.icon;
            return (
              <Link
                key={group}
                href={`/admin/section/${meta.slug}`}
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Icon className="size-4 shrink-0" />
                {group}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to site
        </Link>
      </div>
    </>
  );
}

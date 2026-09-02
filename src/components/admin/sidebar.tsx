"use client";

import { usePathname } from "next/navigation";
import type { AdminSection } from "@/lib/rbac";
import { groupForPath } from "./nav";
import { SectionNav } from "./sidebar-nav";

/**
 * The desktop sidebar. It is contextual: hidden on the dashboard landing page
 * (`/admin`, where the section tiles are the content) and scoped to the current
 * section's pages once the user enters one.
 */
export function Sidebar({ sections }: { sections: AdminSection[] }) {
  const pathname = usePathname();
  const group = groupForPath(pathname);

  if (!group) return null;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="text-lg font-bold tracking-tight">
          H-SETS <span className="text-primary">Admin</span>
        </span>
      </div>
      <SectionNav group={group} sections={sections} />
    </aside>
  );
}

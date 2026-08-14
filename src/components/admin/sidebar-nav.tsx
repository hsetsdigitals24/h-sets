"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { AdminSection } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { NAV_ITEMS, NAV_GROUPS } from "./nav";

/**
 * The admin navigation body — the grouped accordion of section links plus the
 * "Back to site" footer. Shared by the desktop {@link Sidebar} and the mobile
 * drawer so both stay in sync. `onNavigate` lets the drawer close itself when a
 * link is tapped.
 */
export function SidebarNav({
  sections,
  onNavigate,
}: {
  sections: AdminSection[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => sections.includes(item.section));
  const visibleGroups = NAV_GROUPS.filter((group) =>
    items.some((item) => item.group === group)
  );

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  // Groups are collapsed by default; only the group containing the active
  // route starts open so the current page's link stays visible.
  const activeItem = items.find((item) => isActive(item.href));
  const defaultOpen = activeItem ? [activeItem.group] : [];

  return (
    <>
      <nav className="flex-1 overflow-y-auto p-3">
        <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
          {visibleGroups.map((group) => {
            const groupItems = items.filter((item) => item.group === group);
            return (
              <AccordionItem key={group} value={group} className="border-b-0">
                <AccordionTrigger className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground hover:no-underline [&>svg]:size-4">
                  {group}
                </AccordionTrigger>
                <AccordionContent className="space-y-1 pb-1 pr-0 pt-1 leading-normal">
                  {groupItems.map((item) => {
                    const active = isActive(item.href);
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
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
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

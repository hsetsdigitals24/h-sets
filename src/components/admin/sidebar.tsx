"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Role } from "@prisma/client";
import { canAccess } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { NAV_ITEMS, NAV_GROUPS } from "./nav";

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => canAccess(role, item.section));
  const visibleGroups = NAV_GROUPS.filter((group) =>
    items.some((item) => item.group === group)
  );

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="text-lg font-bold tracking-tight">
          H-SETS <span className="text-primary">Admin</span>
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <Accordion type="multiple" defaultValue={[...visibleGroups]} className="w-full">
          {visibleGroups.map((group) => {
            const groupItems = items.filter((item) => item.group === group);
            return (
              <AccordionItem key={group} value={group} className="border-b-0">
                <AccordionTrigger className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground hover:no-underline [&>svg]:size-4">
                  {group}
                </AccordionTrigger>
                <AccordionContent className="space-y-1 pb-1 pr-0 pt-1 leading-normal">
                  {groupItems.map((item) => {
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
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
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}

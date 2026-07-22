"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, ClipboardList, FileCheck2, Award, User, Bell, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const NAV_GROUPS = ["Overview", "Learning", "Account"] as const;

const NAV = [
  { group: "Overview", label: "Dashboard", href: "/account", icon: LayoutDashboard, exact: true },
  { group: "Learning", label: "My Learning", href: "/account/learn", icon: BookOpen },
  { group: "Learning", label: "Assignments", href: "/account/assignments", icon: ClipboardList },
  { group: "Learning", label: "Exams", href: "/account/exams", icon: FileCheck2 },
  { group: "Learning", label: "Certificates", href: "/account/certificates", icon: Award },
  { group: "Account", label: "Notifications", href: "/account/notifications", icon: Bell },
  { group: "Account", label: "Profile", href: "/account/profile", icon: User },
];

export function StudentSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="text-lg font-bold tracking-tight">
          H-SETS <span className="text-primary">Academy</span>
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <Accordion type="multiple" defaultValue={[...NAV_GROUPS]} className="w-full">
          {NAV_GROUPS.map((group) => {
            const groupItems = NAV.filter((item) => item.group === group);
            if (groupItems.length === 0) return null;
            return (
              <AccordionItem key={group} value={group} className="border-b-0">
                <AccordionTrigger className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-foreground hover:no-underline [&>svg]:size-4">
                  {group}
                </AccordionTrigger>
                <AccordionContent className="space-y-1 pb-1 pr-0 pt-1 leading-normal">
                  {groupItems.map((item) => {
                    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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

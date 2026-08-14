"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/finance", label: "Overview" },
  { href: "/admin/finance/transactions", label: "Transactions" },
  { href: "/admin/finance/budgets", label: "Budgets" },
  { href: "/admin/finance/categories", label: "Categories" },
];

export function FinanceTabs() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-border">
      {TABS.map((tab) => {
        const active =
          tab.href === "/admin/finance"
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

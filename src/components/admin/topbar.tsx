import { LogOut } from "lucide-react";
import type { Role } from "@prisma/client";
import { ROLE_LABELS, type AdminSection } from "@/lib/rbac";
import { signOutAction } from "@/app/admin/actions";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { MobileNav } from "@/components/admin/mobile-nav";

export function Topbar({
  name,
  role,
  sections,
}: {
  name?: string | null;
  role: Role;
  sections: AdminSection[];
}) {
  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileNav sections={sections} />
        <div className="text-base font-bold md:hidden">
          H-SETS <span className="text-primary">Admin</span>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationBell viewAllHref="/admin/notifications" />
        <div className="hidden text-right leading-tight sm:block">
          <div className="text-sm font-semibold">{name ?? "Admin"}</div>
          <div className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary sm:px-4"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  );
}

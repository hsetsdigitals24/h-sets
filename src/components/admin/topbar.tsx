import { LogOut } from "lucide-react";
import type { Role } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/rbac";
import { signOutAction } from "@/app/admin/actions";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function Topbar({ name, role }: { name?: string | null; role: Role }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="md:hidden text-base font-bold">
        H-SETS <span className="text-primary">Admin</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <NotificationBell viewAllHref="/admin/notifications" />
        <div className="text-right leading-tight">
          <div className="text-sm font-semibold">{name ?? "Admin"}</div>
          <div className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}

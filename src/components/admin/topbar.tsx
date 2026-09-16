import Link from "next/link";
import { LogOut } from "lucide-react";
import type { Role } from "@prisma/client";
import { ROLE_LABELS, type AdminSection } from "@/lib/rbac";
import { signOutAction } from "@/app/admin/actions";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { MobileNav } from "@/components/admin/mobile-nav";
import { HeaderBrand } from "@/components/admin/header-brand";
import { Avatar } from "@/components/ui/avatar";

export function Topbar({
  name,
  image,
  role,
  sections,
}: {
  name?: string | null;
  image?: string | null;
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
        <HeaderBrand />
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationBell viewAllHref="/admin/notifications" />
        <Link
          href="/admin/profile"
          title="My profile"
          className="flex items-center gap-2.5 rounded-full p-0.5 pr-1 transition-colors hover:bg-secondary sm:pr-3"
        >
          <Avatar src={image} name={name} size={36} />
          <span className="hidden text-right leading-tight sm:block">
            <span className="block text-sm font-semibold">{name ?? "Admin"}</span>
            <span className="block text-xs text-muted-foreground">
              {ROLE_LABELS[role]}
            </span>
          </span>
          <span className="sr-only sm:hidden">My profile</span>
        </Link>
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

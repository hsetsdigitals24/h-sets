import { LogOut } from "lucide-react";
import { signOutStudent } from "@/app/(student)/actions";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { StudentMobileNav } from "@/components/student/mobile-nav";

export function StudentTopbar({ name }: { name?: string | null }) {
  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <StudentMobileNav />
        <div className="md:hidden text-base font-bold">
          H-SETS <span className="text-primary">Academy</span>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        <NotificationBell viewAllHref="/account/notifications" />
        <div className="hidden text-right leading-tight sm:block">
          <div className="text-sm font-semibold">{name ?? "Student"}</div>
          <div className="text-xs text-muted-foreground">Student</div>
        </div>
        <form action={signOutStudent}>
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

import { LogOut } from "lucide-react";
import { signOutStudent } from "@/app/(student)/actions";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function StudentTopbar({ name }: { name?: string | null }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="md:hidden text-base font-bold">
        H-SETS <span className="text-primary">Academy</span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <NotificationBell viewAllHref="/account/notifications" />
        <div className="text-right leading-tight">
          <div className="text-sm font-semibold">{name ?? "Student"}</div>
          <div className="text-xs text-muted-foreground">Student</div>
        </div>
        <form action={signOutStudent}>
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

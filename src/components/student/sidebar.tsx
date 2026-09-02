import Link from "next/link";
import { StudentNavLinks } from "./nav-links";

export function StudentSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <Link
        href="/account"
        className="flex h-16 items-center gap-2 border-b border-border px-6"
      >
        <span className="text-lg font-bold tracking-tight">
          H-SETS <span className="text-primary">Academy</span>
        </span>
      </Link>
      <StudentNavLinks />
    </aside>
  );
}

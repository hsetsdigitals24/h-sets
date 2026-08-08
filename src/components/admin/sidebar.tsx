import type { Role } from "@prisma/client";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="text-lg font-bold tracking-tight">
          H-SETS <span className="text-primary">Admin</span>
        </span>
      </div>
      <SidebarNav role={role} />
    </aside>
  );
}

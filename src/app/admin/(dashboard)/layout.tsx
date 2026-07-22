import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <Sidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={user.name} role={user.role} />
        <div className="flex-1 overflow-x-hidden p-6">{children}</div>
      </div>
    </div>
  );
}

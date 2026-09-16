import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser, getAllowedSections } from "@/lib/auth";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { SectionTheme } from "@/components/admin/section-theme";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const sections = await getAllowedSections(user.id, user.role);
  // Read the profile picture from the database rather than the JWT so a freshly
  // uploaded one shows immediately, without the member signing out and back in.
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, image: true },
  });

  return (
    <SectionTheme>
      <div className="flex min-h-screen w-full bg-muted/30">
        <Sidebar sections={sections} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            name={profile?.name ?? user.name}
            image={profile?.image}
            role={user.role}
            sections={sections}
          />
          <div className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </SectionTheme>
  );
}

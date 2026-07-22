import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { StudentSidebar } from "@/components/student/sidebar";
import { StudentTopbar } from "@/components/student/topbar";

export const metadata: Metadata = {
  title: { default: "Student Portal", template: "%s · H-SETS Academy" },
  robots: { index: false, follow: false },
};

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Unauthenticated visitors go to the public login; staff belong in /admin.
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/admin");
  const user = session.user;

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <StudentSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <StudentTopbar name={user.name} />
        <div className="flex-1 overflow-x-hidden p-6">{children}</div>
      </div>
    </div>
  );
}

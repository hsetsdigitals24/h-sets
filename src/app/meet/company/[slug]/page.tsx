import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { companyMeetingAccess } from "@/lib/livekit";
import { CompanyRoom } from "./room";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Company standup",
  robots: { index: false, follow: false },
};

export default async function CompanyMeetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user) redirect(`/login?next=/meet/company/${slug}`);

  const access = await companyMeetingAccess(session.user, slug);
  if (!access.ok) {
    // Room doesn't exist, or this user is a student (not internal staff).
    if (!access.exists) notFound();
    redirect("/admin/standups");
  }

  // Any staff member who can join can also record a standup (no per-room owner).
  return <CompanyRoom slug={slug} title={access.name ?? "Standup"} canRecord />;
}

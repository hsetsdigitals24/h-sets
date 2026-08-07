import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { projectMeetingAccess } from "@/lib/livekit";
import { ProjectRoom } from "./room";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Project meeting",
  robots: { index: false, follow: false },
};

export default async function ProjectMeetPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const session = await auth();
  if (!session?.user) redirect(`/login?next=/meet/project/${projectId}`);

  const access = await projectMeetingAccess(session.user, projectId);
  if (!access.ok) {
    // Project doesn't exist, or this user isn't a member of it.
    if (!access.exists) notFound();
    redirect(`/admin/projects/${projectId}`);
  }

  return <ProjectRoom projectId={projectId} title={access.name ?? "Meeting"} />;
}

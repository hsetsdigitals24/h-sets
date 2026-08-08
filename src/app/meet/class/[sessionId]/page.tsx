import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { classSessionAccess } from "@/lib/livekit";
import { ClassRoom } from "./room";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Class call",
  robots: { index: false, follow: false },
};

export default async function ClassMeetPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const session = await auth();
  if (!session?.user) redirect(`/login?next=/meet/class/${sessionId}`);

  const access = await classSessionAccess(session.user, sessionId);
  if (!access.ok) {
    // Either the session doesn't exist or this user isn't a member of it.
    if (!access.cohortId) notFound();
    redirect(session.user.role === "STUDENT" ? "/account" : "/admin");
  }

  return (
    <ClassRoom
      sessionId={sessionId}
      title={access.title ?? "Class"}
      isStudent={access.isStudent ?? false}
      // Only instructors / academy admins may record — never students.
      canRecord={access.isStudent === false}
    />
  );
}

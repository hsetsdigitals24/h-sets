import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { presignDownload } from "@/lib/storage";
import { classSessionAccess, projectMeetingAccess } from "@/lib/livekit";

/**
 * Redirects to a short-lived presigned URL for a finished recording.
 *
 * GET /api/livekit/recording/[id]/download            → inline (for <video> playback)
 * GET /api/livekit/recording/[id]/download?download=1 → forced attachment download
 *
 * Access mirrors who may join the underlying room: for a class, the enrolled
 * student / assigned instructor / academy admin; for a project, any member.
 * The private bucket is never public — every view goes through this gate.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await params;
  const asAttachment = new URL(req.url).searchParams.get("download") === "1";

  const recording = await prisma.recording.findUnique({
    where: { id },
    select: { status: true, storageKey: true, classSessionId: true, projectId: true },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording not found." }, { status: 404 });
  }
  if (recording.status !== "READY" || !recording.storageKey) {
    return NextResponse.json({ error: "Recording isn't ready yet." }, { status: 409 });
  }

  const allowed = recording.classSessionId
    ? (await classSessionAccess(session.user, recording.classSessionId)).ok
    : recording.projectId
      ? (await projectMeetingAccess(session.user, recording.projectId)).ok
      : false;
  if (!allowed) {
    return NextResponse.json({ error: "No access to this recording." }, { status: 403 });
  }

  let url: string;
  try {
    url = await presignDownload(
      recording.storageKey,
      asAttachment ? `recording-${id}.mp4` : undefined
    );
  } catch {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }
  return NextResponse.redirect(url);
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  classSessionAccess,
  canRecordProject,
  canRecordCompany,
} from "@/lib/livekit";
import {
  generateMeetingNotes,
  isNoteTakerConfigured,
} from "@/lib/meeting-notes";

/**
 * Generate (or regenerate) AI meeting notes for a finished recording.
 *
 * POST /api/livekit/recording/[id]/notes → { ok: true } | { error }
 *
 * Transcribes the recording's audio and summarises it. Gated to the same people
 * who may start a recording — for a project the OWNER / super admin, for a class
 * the assigned instructor / academy admin (not students) — because generation
 * spends on the OpenAI API. Runs synchronously (Fluid Compute), so the client
 * awaits the result and then refreshes to show the notes.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await params;

  const recording = await prisma.recording.findUnique({
    where: { id },
    select: { status: true, classSessionId: true, projectId: true, companyRoomId: true },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording not found." }, { status: 404 });
  }
  if (recording.status !== "READY") {
    return NextResponse.json(
      { error: "Recording isn't ready yet." },
      { status: 409 }
    );
  }

  const allowed = recording.classSessionId
    ? await (async () => {
        const a = await classSessionAccess(session.user, recording.classSessionId!);
        return a.ok && !a.isStudent;
      })()
    : recording.projectId
      ? await canRecordProject(session.user, recording.projectId)
      : recording.companyRoomId
        ? await canRecordCompany(session.user, recording.companyRoomId)
        : false;
  if (!allowed) {
    return NextResponse.json(
      { error: "You can't generate notes for this recording." },
      { status: 403 }
    );
  }

  if (!isNoteTakerConfigured()) {
    return NextResponse.json(
      { error: "The note-taker isn't configured yet (set OPENAI_API_KEY)." },
      { status: 503 }
    );
  }

  const result = await generateMeetingNotes(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

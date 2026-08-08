import { NextResponse } from "next/server";
import type { RecordingStatus, Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  classSessionAccess,
  projectMeetingAccess,
  canRecordProject,
  isRecordingConfigured,
  startRoomRecording,
  stopRoomRecording,
  roomForClassSession,
  roomForProject,
} from "@/lib/livekit";

/**
 * Start / stop recording a video call, and report the current recording state.
 *
 * GET  /api/livekit/recording?sessionId=… | ?projectId=…
 *        → { configured, canRecord, recording: { id, status } | null }
 * POST /api/livekit/recording  { action: "start" | "stop", sessionId? | projectId? }
 *        → { recording: { id, status } }
 *
 * Recording is privileged: for a class only the assigned instructor / academy
 * admin (not students) may record; for a project only the OWNER / super admin.
 * The finished MP4 is written straight to the private R2 bucket by LiveKit
 * egress; the /api/livekit/webhook handler finalises the DB row on end.
 */

// Statuses that mean "a recording is in flight" for this room.
const IN_FLIGHT: RecordingStatus[] = ["STARTING", "ACTIVE", "PROCESSING"];

type Target =
  | { kind: "class"; id: string; room: string }
  | { kind: "project"; id: string; room: string };

/** Resolve + authorize the recording target from query/body params. */
async function resolveTarget(
  user: { id: string; role: Role },
  sessionId: string | null,
  projectId: string | null
): Promise<
  | { ok: true; target: Target }
  | { ok: false; status: number; error: string }
> {
  if (sessionId) {
    const access = await classSessionAccess(user, sessionId);
    if (!access.ok || access.isStudent) {
      return { ok: false, status: 403, error: "You can't record this class." };
    }
    return { ok: true, target: { kind: "class", id: sessionId, room: roomForClassSession(sessionId) } };
  }
  if (projectId) {
    const access = await projectMeetingAccess(user, projectId);
    if (!access.exists) return { ok: false, status: 404, error: "Project not found." };
    if (!(await canRecordProject(user, projectId))) {
      return { ok: false, status: 403, error: "You can't record this meeting." };
    }
    return { ok: true, target: { kind: "project", id: projectId, room: roomForProject(projectId) } };
  }
  return { ok: false, status: 400, error: "Missing sessionId or projectId." };
}

/** The in-flight recording for a target, if any. */
function inFlightWhere(target: Target) {
  return {
    status: { in: IN_FLIGHT },
    ...(target.kind === "class"
      ? { classSessionId: target.id }
      : { projectId: target.id }),
  };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const url = new URL(req.url);
  const resolved = await resolveTarget(
    session.user,
    url.searchParams.get("sessionId"),
    url.searchParams.get("projectId")
  );
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const recording = await prisma.recording.findFirst({
    where: inFlightWhere(resolved.target),
    orderBy: { startedAt: "desc" },
    select: { id: true, status: true },
  });

  return NextResponse.json({
    configured: isRecordingConfigured(),
    canRecord: true,
    recording,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { action?: unknown; sessionId?: unknown; projectId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = body.action;
  if (action !== "start" && action !== "stop") {
    return NextResponse.json({ error: "action must be 'start' or 'stop'." }, { status: 400 });
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
  const projectId = typeof body.projectId === "string" ? body.projectId : null;
  const resolved = await resolveTarget(session.user, sessionId, projectId);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }
  const { target } = resolved;

  if (!isRecordingConfigured()) {
    return NextResponse.json(
      { error: "Recording isn't configured yet." },
      { status: 503 }
    );
  }

  const existing = await prisma.recording.findFirst({
    where: inFlightWhere(target),
    orderBy: { startedAt: "desc" },
  });

  if (action === "start") {
    // Already recording → return the live job rather than starting a second one.
    if (existing) {
      return NextResponse.json({
        recording: { id: existing.id, status: existing.status },
      });
    }
    let job: { egressId: string; storageKey: string };
    try {
      job = await startRoomRecording(target.room);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Could not start recording." },
        { status: 502 }
      );
    }
    const recording = await prisma.recording.create({
      data: {
        egressId: job.egressId,
        roomName: target.room,
        storageKey: job.storageKey,
        status: "STARTING",
        startedById: session.user.id,
        ...(target.kind === "class"
          ? { classSessionId: target.id }
          : { projectId: target.id }),
      },
      select: { id: true, status: true },
    });
    return NextResponse.json({ recording });
  }

  // action === "stop"
  if (!existing) {
    return NextResponse.json({ error: "Nothing is recording." }, { status: 409 });
  }
  try {
    await stopRoomRecording(existing.egressId);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not stop recording." },
      { status: 502 }
    );
  }
  const recording = await prisma.recording.update({
    where: { id: existing.id },
    data: { status: "PROCESSING" },
    select: { id: true, status: true },
  });
  return NextResponse.json({ recording });
}

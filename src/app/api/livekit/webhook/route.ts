import { NextResponse } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import {
  attendanceMinSeconds,
  classSessionIdFromRoom,
  projectIdFromRoom,
  livekitConfig,
} from "@/lib/livekit";

/**
 * LiveKit webhook → auto-attendance (minimum-stay rule).
 *
 * Configure this URL in the LiveKit dashboard (Settings → Webhooks):
 *   https://<your-app>/api/livekit/webhook
 *
 * Events used:
 *  - participant_joined : open an interval (activeSince = now)
 *  - participant_left   : close it, accumulate seconds, flip `present` once the
 *                         total crosses ATTENDANCE_MIN_SECONDS
 *  - room_finished      : close any still-open intervals (crash / no leave event)
 *
 * Attendance is only recorded for students actually enrolled in the cohort;
 * instructors and admins joining the room are ignored.
 */
export async function POST(req: Request) {
  let cfg: ReturnType<typeof livekitConfig>;
  try {
    cfg = livekitConfig();
  } catch {
    return NextResponse.json({ error: "LiveKit not configured" }, { status: 503 });
  }

  const receiver = new WebhookReceiver(cfg.apiKey, cfg.apiSecret);
  const body = await req.text();
  const authHeader = req.headers.get("Authorization") ?? "";

  let event;
  try {
    // Verifies the signature against the API secret; throws if invalid.
    event = await receiver.receive(body, authHeader);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const room = event.room?.name;
  if (!room) return NextResponse.json({ ok: true });

  const classSessionId = classSessionIdFromRoom(room);
  const projectId = projectIdFromRoom(room);

  try {
    if (classSessionId) {
      await handleClassEvent(event, classSessionId);
    } else if (projectId) {
      await handleProjectEvent(event, projectId);
    }
    // Any other room name is ignored.
  } catch (err) {
    console.error("livekit webhook error", err);
    // Return 200 so LiveKit doesn't hammer retries for our own DB hiccups;
    // the room_finished sweep will reconcile any missed intervals.
  }

  return NextResponse.json({ ok: true });
}

/** Route class-room lifecycle events to attendance handlers. */
async function handleClassEvent(
  event: Awaited<ReturnType<WebhookReceiver["receive"]>>,
  sessionId: string
) {
  switch (event.event) {
    case "participant_joined": {
      const studentId = event.participant?.identity;
      if (studentId) await handleJoin(sessionId, studentId);
      break;
    }
    case "participant_left": {
      const studentId = event.participant?.identity;
      if (studentId) await handleLeave(sessionId, studentId);
      break;
    }
    case "room_finished": {
      await handleRoomFinished(sessionId);
      break;
    }
  }
}

/** Open an attendance interval — only for genuinely enrolled students. */
async function handleJoin(sessionId: string, studentId: string) {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { cohortId: true },
  });
  if (!session) return;

  const enrolled = await prisma.enrollment.count({
    where: { studentId, cohortId: session.cohortId, status: { not: "withdrawn" } },
  });
  if (enrolled === 0) return; // instructor / admin — don't track

  const now = new Date();
  await prisma.attendance.upsert({
    where: { sessionId_studentId: { sessionId, studentId } },
    create: {
      sessionId,
      studentId,
      source: "livekit",
      present: false,
      activeSince: now,
      firstJoinedAt: now,
    },
    update: {
      source: "livekit",
      // Reopen the interval for this (re)join. firstJoinedAt is left untouched
      // here and backfilled below only if it was never set.
      activeSince: now,
    },
  });

  // Backfill firstJoinedAt on the very first join (upsert.update can't read the
  // existing row to make this conditional inline).
  await prisma.attendance.updateMany({
    where: { sessionId, studentId, firstJoinedAt: null },
    data: { firstJoinedAt: now },
  });
}

/** Close an open interval and accumulate time; flip `present` at threshold. */
async function handleLeave(sessionId: string, studentId: string) {
  await accumulate(sessionId, studentId);
}

/** Sweep any participants still marked active when the room ends. */
async function handleRoomFinished(sessionId: string) {
  const open = await prisma.attendance.findMany({
    where: { sessionId, activeSince: { not: null } },
    select: { studentId: true },
  });
  for (const row of open) {
    await accumulate(sessionId, row.studentId);
  }
}

/**
 * Adds (now - activeSince) to secondsInCall, clears the open interval, and marks
 * present once the accumulated time meets the minimum-stay threshold. Wrapped in
 * a transaction so overlapping leave/room_finished events don't double-count.
 */
async function accumulate(sessionId: string, studentId: string) {
  const threshold = attendanceMinSeconds();
  await prisma.$transaction(async (tx) => {
    const row = await tx.attendance.findUnique({
      where: { sessionId_studentId: { sessionId, studentId } },
    });
    if (!row || !row.activeSince) return; // nothing open

    const now = new Date();
    const delta = Math.max(
      0,
      Math.floor((now.getTime() - row.activeSince.getTime()) / 1000)
    );
    const total = row.secondsInCall + delta;

    await tx.attendance.update({
      where: { id: row.id },
      data: {
        secondsInCall: total,
        activeSince: null,
        lastLeftAt: now,
        present: row.present || total >= threshold,
      },
    });
  });
}

// ---------------------------------------------------------------------------
// Project meeting participation (no threshold — just a "who joined, how long" log)
// ---------------------------------------------------------------------------

/** Route project-room lifecycle events to participation handlers. */
async function handleProjectEvent(
  event: Awaited<ReturnType<WebhookReceiver["receive"]>>,
  projectId: string
) {
  const roomSid = event.room?.sid;
  if (!roomSid) return;

  switch (event.event) {
    case "participant_joined": {
      const userId = event.participant?.identity;
      if (userId) await handleProjectJoin(projectId, roomSid, userId);
      break;
    }
    case "participant_left": {
      const userId = event.participant?.identity;
      if (userId) await accumulateProject(roomSid, userId);
      break;
    }
    case "room_finished": {
      const open = await prisma.projectMeetingLog.findMany({
        where: { roomSid, activeSince: { not: null } },
        select: { userId: true },
      });
      for (const row of open) await accumulateProject(roomSid, row.userId);
      break;
    }
  }
}

/** Open a participation interval for this meeting instance. */
async function handleProjectJoin(
  projectId: string,
  roomSid: string,
  userId: string
) {
  // Ignore identities that aren't real users (defensive; identity is User.id).
  const exists = await prisma.user.count({ where: { id: userId } });
  if (exists === 0) return;

  const now = new Date();
  await prisma.projectMeetingLog.upsert({
    where: { roomSid_userId: { roomSid, userId } },
    create: { projectId, roomSid, userId, activeSince: now, firstJoinedAt: now },
    update: { activeSince: now },
  });
}

/** Close an open project interval and accumulate seconds. */
async function accumulateProject(roomSid: string, userId: string) {
  await prisma.$transaction(async (tx) => {
    const row = await tx.projectMeetingLog.findUnique({
      where: { roomSid_userId: { roomSid, userId } },
    });
    if (!row || !row.activeSince) return;

    const now = new Date();
    const delta = Math.max(
      0,
      Math.floor((now.getTime() - row.activeSince.getTime()) / 1000)
    );

    await tx.projectMeetingLog.update({
      where: { id: row.id },
      data: {
        secondsInCall: row.secondsInCall + delta,
        activeSince: null,
        lastLeftAt: now,
      },
    });
  });
}

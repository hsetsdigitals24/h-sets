import "server-only";
import { RoomServiceClient } from "livekit-server-sdk";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * LiveKit helpers for class video calls + auto-attendance.
 *
 * One LiveKit room maps 1:1 to a ClassSession (room name = `class-<id>`). A
 * participant's LiveKit identity is their User.id, which lets the webhook
 * resolve who joined and mark attendance (see /api/livekit/webhook).
 *
 * Provisioned via LiveKit Cloud (not the Vercel Marketplace). Set:
 *   LIVEKIT_URL         wss://<project>.livekit.cloud
 *   LIVEKIT_API_KEY
 *   LIVEKIT_API_SECRET
 *   ATTENDANCE_MIN_SECONDS   optional, default 600 (10 min minimum stay)
 */

export const ROOM_PREFIX = "class-";
export const PROJECT_ROOM_PREFIX = "project-";

export function roomForClassSession(sessionId: string): string {
  return `${ROOM_PREFIX}${sessionId}`;
}

export function classSessionIdFromRoom(room: string): string | null {
  return room.startsWith(ROOM_PREFIX) ? room.slice(ROOM_PREFIX.length) : null;
}

export function roomForProject(projectId: string): string {
  return `${PROJECT_ROOM_PREFIX}${projectId}`;
}

export function projectIdFromRoom(room: string): string | null {
  return room.startsWith(PROJECT_ROOM_PREFIX)
    ? room.slice(PROJECT_ROOM_PREFIX.length)
    : null;
}

/** Minimum seconds in the call before a student is marked present. */
export function attendanceMinSeconds(): number {
  const n = Number(process.env.ATTENDANCE_MIN_SECONDS);
  return Number.isFinite(n) && n > 0 ? n : 600;
}

export function livekitConfig() {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!url || !apiKey || !apiSecret) {
    throw new Error(
      "LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET."
    );
  }
  return { url, apiKey, apiSecret };
}

/**
 * Lazily-built RoomServiceClient for querying live room state (who's connected
 * right now). Returns null when LiveKit isn't configured so presence features
 * degrade to "nobody in call" instead of throwing.
 */
let roomService: RoomServiceClient | null = null;
function roomServiceClient(): RoomServiceClient | null {
  try {
    const cfg = livekitConfig();
    if (!roomService) {
      // RoomServiceClient speaks HTTP(S); LIVEKIT_URL is the ws(s) signalling URL.
      const httpUrl = cfg.url.replace(/^ws/, "http");
      roomService = new RoomServiceClient(httpUrl, cfg.apiKey, cfg.apiSecret);
    }
    return roomService;
  } catch {
    return null;
  }
}

export type LivePresence = { count: number; names: string[] };

/**
 * Who is *currently* connected to a project's meeting room, read straight from
 * LiveKit — the ground truth, unlike the webhook log which can lag if an event
 * is missed. Returns empty presence when LiveKit is unconfigured or the room is
 * idle (listParticipants throws for a room nobody has opened yet).
 */
export async function projectLivePresence(
  projectId: string
): Promise<LivePresence> {
  const svc = roomServiceClient();
  if (!svc) return { count: 0, names: [] };
  try {
    const parts = await svc.listParticipants(roomForProject(projectId));
    return {
      count: parts.length,
      names: parts.map((p) => p.name || p.identity).filter(Boolean),
    };
  } catch {
    return { count: 0, names: [] };
  }
}

type Actor = { id: string; role: Role };

export type ClassAccess = {
  ok: boolean;
  cohortId?: string;
  title?: string;
  /** True when this actor's presence should count toward attendance. */
  isStudent?: boolean;
};

/**
 * Decides whether `user` may join the video room for a class session:
 *  - the enrolled student (attendance-tracked),
 *  - the cohort's assigned instructor,
 *  - an ACADEMY_ADMIN / SUPER_ADMIN.
 */
export async function classSessionAccess(
  user: Actor,
  sessionId: string
): Promise<ClassAccess> {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { cohortId: true, title: true },
  });
  if (!session) return { ok: false };
  const { cohortId, title } = session;

  if (user.role === "SUPER_ADMIN" || user.role === "ACADEMY_ADMIN") {
    return { ok: true, cohortId, title, isStudent: false };
  }

  if (user.role === "INSTRUCTOR") {
    const assigned = await prisma.cohort.count({
      where: { id: cohortId, instructors: { some: { userId: user.id } } },
    });
    return { ok: assigned > 0, cohortId, title, isStudent: false };
  }

  if (user.role === "STUDENT") {
    const enrolled = await prisma.enrollment.count({
      where: { studentId: user.id, cohortId, status: { not: "withdrawn" } },
    });
    return { ok: enrolled > 0, cohortId, title, isStudent: true };
  }

  return { ok: false };
}

export type ProjectAccess = { ok: boolean; exists: boolean; name?: string };

/**
 * Decides whether `user` may join a project's meeting room.
 * Access is restricted to members of that specific project; SUPER_ADMIN can
 * always join. Participation is logged via the LiveKit webhook.
 */
export async function projectMeetingAccess(
  user: Actor,
  projectId: string
): Promise<ProjectAccess> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });
  if (!project) return { ok: false, exists: false };

  if (user.role === "SUPER_ADMIN") {
    return { ok: true, exists: true, name: project.name };
  }

  const isMember = await prisma.projectMember.count({
    where: { projectId, userId: user.id },
  });
  return { ok: isMember > 0, exists: true, name: project.name };
}

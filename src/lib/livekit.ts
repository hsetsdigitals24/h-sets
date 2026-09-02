import "server-only";
import {
  RoomServiceClient,
  EgressClient,
  EgressStatus,
  EncodedFileOutput,
  EncodedFileType,
  S3Upload,
} from "livekit-server-sdk";
import type { EgressInfo } from "livekit-server-sdk";
import { randomUUID, randomBytes } from "crypto";
import type { Role, RecordingStatus } from "@prisma/client";
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
export const COMPANY_ROOM_PREFIX = "company-";

/**
 * Company-wide standup rooms — always-on internal video calls that live outside
 * any project or cohort. Created on demand by staff and stored in the DB (see
 * the CompanyRoom model); each has a stable room name `company-<slug>` that
 * staff join. There's no per-room membership — every non-student can join any
 * room.
 */
export type CompanyRoomInfo = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

/** All company standup rooms, oldest first (stable order for the directory). */
export async function listCompanyRooms(): Promise<CompanyRoomInfo[]> {
  return prisma.companyRoom.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, name: true, description: true },
  });
}

export async function companyRoomBySlug(
  slug: string
): Promise<CompanyRoomInfo | null> {
  return prisma.companyRoom.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, description: true },
  });
}

export function roomForCompany(slug: string): string {
  return `${COMPANY_ROOM_PREFIX}${slug}`;
}

export function companySlugFromRoom(room: string): string | null {
  return room.startsWith(COMPANY_ROOM_PREFIX)
    ? room.slice(COMPANY_ROOM_PREFIX.length)
    : null;
}

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

// ---------------------------------------------------------------------------
// Call recording (LiveKit room-composite egress → private R2 bucket)
// ---------------------------------------------------------------------------

/**
 * R2 credentials for LiveKit egress uploads. LiveKit's egress workers write the
 * finished MP4 straight to our private bucket (S3-compatible), so recordings
 * never transit our own servers. Returns null when storage isn't configured.
 */
function egressR2Config() {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
  } = process.env;
  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET
  ) {
    return null;
  }
  return {
    accessKey: R2_ACCESS_KEY_ID,
    secret: R2_SECRET_ACCESS_KEY,
    bucket: R2_BUCKET,
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  };
}

/** True when both LiveKit and the private R2 bucket are configured. */
export function isRecordingConfigured(): boolean {
  try {
    livekitConfig();
  } catch {
    return false;
  }
  return egressR2Config() !== null;
}

let egressService: EgressClient | null = null;
function egressClient(): EgressClient {
  const cfg = livekitConfig();
  if (!egressService) {
    const httpUrl = cfg.url.replace(/^ws/, "http");
    egressService = new EgressClient(httpUrl, cfg.apiKey, cfg.apiSecret);
  }
  return egressService;
}

/** Object key (in the private bucket) for a new recording of `room`. */
export function recordingKey(room: string): string {
  return `recordings/${room}/${randomUUID()}.mp4`;
}

/**
 * Start recording a room to R2 and return the egress job. Throws with a clear
 * message when LiveKit or storage isn't configured. The caller persists the
 * returned `egressId` + `storageKey`; the webhook finalises the row on end.
 */
export async function startRoomRecording(
  room: string
): Promise<{ egressId: string; storageKey: string }> {
  const r2 = egressR2Config();
  if (!r2) {
    throw new Error(
      "Recording storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET."
    );
  }
  const storageKey = recordingKey(room);
  const output = new EncodedFileOutput({
    fileType: EncodedFileType.MP4,
    filepath: storageKey,
    output: {
      case: "s3",
      value: new S3Upload({
        accessKey: r2.accessKey,
        secret: r2.secret,
        bucket: r2.bucket,
        endpoint: r2.endpoint,
        region: "auto",
        // R2 requires path-style addressing.
        forcePathStyle: true,
      }),
    },
  });

  const info = await egressClient().startRoomCompositeEgress(room, output);
  return { egressId: info.egressId, storageKey };
}

/** Egress states that mean the job is already stopping or finished. */
const TERMINAL_EGRESS = new Set<EgressStatus>([
  EgressStatus.EGRESS_ENDING,
  EgressStatus.EGRESS_COMPLETE,
  EgressStatus.EGRESS_FAILED,
  EgressStatus.EGRESS_ABORTED,
  EgressStatus.EGRESS_LIMIT_REACHED,
]);

/**
 * Stop an in-progress recording. Genuinely idempotent: if the egress has already
 * ended (the room emptied and LiveKit auto-stopped it, the webhook finalised it,
 * or another host stopped it) `stopEgress` throws a "already ended / not found"
 * Twirp error — that's success from our point of view, not a failure, so we
 * swallow it. Only real problems (auth, network) propagate.
 */
export async function stopRoomRecording(egressId: string): Promise<void> {
  const client = egressClient();

  // If it's already in a terminal state, there's nothing to stop.
  try {
    const [info] = await client.listEgress({ egressId });
    if (info && TERMINAL_EGRESS.has(info.status)) {
      return;
    }
  } catch {
    // Couldn't look it up (e.g. already purged) — fall through and try to stop.
  }

  try {
    await client.stopEgress(egressId);
  } catch (e) {
    if (isAlreadyEndedError(e)) return; // already stopped — treat as success
    throw e;
  }
}

/**
 * Live reconciliation of a persisted "in-flight" recording against LiveKit's
 * real egress state, so a row that got stuck in-flight (its end webhook never
 * reached us) doesn't make a fresh call look like it's already recording.
 *
 *   "active"   — genuinely still running; keep showing it as recording
 *   "complete" — egress finished; the file exists at its storageKey
 *   "failed"   — egress aborted/failed; no usable file
 *   "unknown"  — lookup failed (transient); leave the row untouched
 */
export async function reconcileEgress(
  egressId: string
): Promise<"active" | "complete" | "failed" | "unknown"> {
  let info: EgressInfo | undefined;
  try {
    [info] = await egressClient().listEgress({ egressId });
  } catch {
    return "unknown";
  }
  if (!info) return "failed"; // purged / unknown id → nothing to play
  if (!TERMINAL_EGRESS.has(info.status)) return "active";
  return info.status === EgressStatus.EGRESS_COMPLETE ? "complete" : "failed";
}

/** Whether a LiveKit egress error means the job was already stopped/gone. */
function isAlreadyEndedError(e: unknown): boolean {
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
  return (
    msg.includes("already ended") ||
    msg.includes("already complete") ||
    msg.includes("not found") ||
    msg.includes("does not exist") ||
    msg.includes("cannot stop")
  );
}

/** Statuses that mean a recording row is still "in flight" (not finalised). */
const IN_FLIGHT_STATUSES: RecordingStatus[] = ["STARTING", "ACTIVE", "PROCESSING"];

/**
 * Self-heal any in-flight recordings for a target against LiveKit's real egress
 * state, then return nothing — the caller re-reads the rows after.
 *
 * This is the fallback for when the egress webhook never reaches us (the usual
 * cause: the LiveKit webhook URL isn't configured, or points at a URL LiveKit
 * can't reach such as localhost in dev). Without it a stopped recording that
 * nobody re-opens stays stuck in PROCESSING forever and never becomes playable.
 *
 * Unlike the lightweight reconcile in the recording GET route, this pulls the
 * finished file's key/duration/size from the egress `fileResults` so a row
 * healed here is as complete as one finalised by the webhook. Best-effort:
 * transient lookup failures leave a row untouched (it retries next view), and a
 * missing LiveKit config is a no-op so the page still renders.
 */
export async function finalizeInFlightRecordings(
  where: { projectId: string } | { classSessionId: string } | { companyRoomId: string }
): Promise<void> {
  const rows = await prisma.recording.findMany({
    where: { status: { in: IN_FLIGHT_STATUSES }, ...where },
    select: { id: true, egressId: true },
  });
  if (rows.length === 0) return;

  let client: EgressClient;
  try {
    client = egressClient();
  } catch {
    return; // LiveKit not configured — nothing to reconcile against
  }

  for (const row of rows) {
    let info: EgressInfo | undefined;
    try {
      [info] = await client.listEgress({ egressId: row.egressId });
    } catch {
      continue; // transient — leave the row for the next view
    }
    if (info && !TERMINAL_EGRESS.has(info.status)) continue; // genuinely still running

    if (info && info.status === EgressStatus.EGRESS_COMPLETE) {
      const file = info.fileResults?.[0];
      await prisma.recording.update({
        where: { id: row.id },
        data: {
          status: "READY",
          endedAt: new Date(),
          ...(file?.filename ? { storageKey: file.filename } : {}),
          // Duration is reported in nanoseconds; size is a byte count.
          ...(file?.duration ? { durationSec: Math.round(Number(file.duration) / 1e9) } : {}),
          ...(file?.size ? { sizeBytes: BigInt(file.size) } : {}),
        },
      });
    } else {
      // Terminal-but-not-complete, or purged/unknown id → no usable file.
      await prisma.recording.update({
        where: { id: row.id },
        data: { status: "FAILED", endedAt: new Date() },
      });
    }
  }
}

/** Re-export so webhook/route code can narrow egress status without deep imports. */
export type { EgressInfo };

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

export type CompanyAccess = {
  ok: boolean;
  exists: boolean;
  id?: string;
  name?: string;
};

/**
 * Decides whether `user` may join a company-wide standup room. The room must
 * exist (be a CompanyRoom record), and the user must be internal staff — i.e.
 * any role except STUDENT. There is no per-room membership; every staff member
 * can join any company room.
 */
export async function companyMeetingAccess(
  user: Actor,
  slug: string
): Promise<CompanyAccess> {
  const room = await companyRoomBySlug(slug);
  if (!room) return { ok: false, exists: false };
  return { ok: user.role !== "STUDENT", exists: true, id: room.id, name: room.name };
}

/**
 * Whether `user` may start/stop/delete a company standup recording. Company
 * rooms have no owner, so any internal staff member (non-student) with the room
 * present may record — the same people who can join it.
 */
export async function canRecordCompany(
  user: Actor,
  companyRoomId: string
): Promise<boolean> {
  if (user.role === "STUDENT") return false;
  const exists = await prisma.companyRoom.count({ where: { id: companyRoomId } });
  return exists > 0;
}

/**
 * Who is *currently* connected to a company standup room, read straight from
 * LiveKit (same ground-truth source as project presence). Empty when LiveKit is
 * unconfigured or nobody has opened the room yet.
 */
export async function companyLivePresence(slug: string): Promise<LivePresence> {
  const svc = roomServiceClient();
  if (!svc) return { count: 0, names: [] };
  try {
    const parts = await svc.listParticipants(roomForCompany(slug));
    return {
      count: parts.length,
      names: parts.map((p) => p.name || p.identity).filter(Boolean),
    };
  } catch {
    return { count: 0, names: [] };
  }
}

// ---------------------------------------------------------------------------
// External-guest invites (login-free join by email link)
// ---------------------------------------------------------------------------

/** Which meeting an invite is for, before it's resolved to a room name. */
export type InviteTarget =
  | { kind: "company"; slug: string }
  | { kind: "project"; id: string }
  | { kind: "class"; id: string };

export type ResolvedInviteTarget =
  | { ok: true; roomName: string; label: string }
  | { ok: false; status: number; error: string };

/** How long a guest invite stays valid, in hours (default 24). */
export function inviteTtlHours(): number {
  const n = Number(process.env.GUEST_INVITE_TTL_HOURS);
  return Number.isFinite(n) && n > 0 ? n : 24;
}

/**
 * How long a shareable "room link" stays valid, in hours (default 720 = 30
 * days). Longer than a personal invite because the same link is reused across
 * recurring standups rather than sent for one call.
 */
export function shareLinkTtlHours(): number {
  const n = Number(process.env.GUEST_SHARE_TTL_HOURS);
  return Number.isFinite(n) && n > 0 ? n : 720;
}

/**
 * Resolve an InviteTarget to a concrete LiveKit room + display label, enforcing
 * that `user` is allowed to invite a guest to it. Inviting is a staff action, so
 * students are refused even for a class they're enrolled in; otherwise the same
 * access gate the room itself uses applies (a member/assignee/admin of that room).
 */
export async function resolveInviteTarget(
  user: Actor,
  target: InviteTarget
): Promise<ResolvedInviteTarget> {
  if (user.role === "STUDENT") {
    return { ok: false, status: 403, error: "Only staff can invite guests." };
  }

  if (target.kind === "company") {
    const access = await companyMeetingAccess(user, target.slug);
    if (!access.exists) return { ok: false, status: 404, error: "Unknown standup room." };
    if (!access.ok) return { ok: false, status: 403, error: "No access to this room." };
    return { ok: true, roomName: roomForCompany(target.slug), label: access.name ?? "Standup" };
  }

  if (target.kind === "project") {
    const access = await projectMeetingAccess(user, target.id);
    if (!access.exists) return { ok: false, status: 404, error: "Project not found." };
    if (!access.ok) return { ok: false, status: 403, error: "No access to this project." };
    return { ok: true, roomName: roomForProject(target.id), label: access.name ?? "Project meeting" };
  }

  const access = await classSessionAccess(user, target.id);
  if (!access.ok) return { ok: false, status: 403, error: "No access to this class." };
  return { ok: true, roomName: roomForClassSession(target.id), label: access.title ?? "Class session" };
}

export type ResolvedShareLink =
  | { ok: true; token: string; label: string; expiresAt: Date }
  | { ok: false; status: number; error: string };

/**
 * Find — or lazily create — the reusable shareable room link for a target,
 * enforcing the same staff access gate as {@link resolveInviteTarget}. The link
 * is stable: re-invoking returns the existing active link so the URL you copy
 * doesn't change between calls; a fresh one is only minted once the previous has
 * expired or been revoked. Unlike a personal invite it has no `email` and its
 * token is reused by many guests (each joins under a unique identity — see the
 * guest-token route).
 */
export async function getOrCreateShareLink(
  user: Actor,
  target: InviteTarget
): Promise<ResolvedShareLink> {
  const resolved = await resolveInviteTarget(user, target);
  if (!resolved.ok) return resolved;

  const existing = await prisma.meetingInvite.findFirst({
    where: {
      roomName: resolved.roomName,
      shareable: true,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { token: true, expiresAt: true },
  });
  if (existing) {
    return { ok: true, token: existing.token, label: resolved.label, expiresAt: existing.expiresAt };
  }

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + shareLinkTtlHours() * 60 * 60 * 1000);
  await prisma.meetingInvite.create({
    data: {
      token,
      roomName: resolved.roomName,
      label: resolved.label,
      shareable: true,
      email: null,
      guestName: null,
      expiresAt,
      createdById: user.id,
    },
  });
  return { ok: true, token, label: resolved.label, expiresAt };
}

/**
 * Whether `user` may start/stop recording a project meeting. Stricter than
 * joining: only the project OWNER or a SUPER_ADMIN can record.
 */
export async function canRecordProject(
  user: Actor,
  projectId: string
): Promise<boolean> {
  if (user.role === "SUPER_ADMIN") return true;
  const owner = await prisma.projectMember.count({
    where: { projectId, userId: user.id, role: "OWNER" },
  });
  return owner > 0;
}

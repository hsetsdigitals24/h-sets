import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { AccessToken } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { livekitConfig } from "@/lib/livekit";

/**
 * Mints a LiveKit token for an external guest from their invite token. This is
 * the ONLY login-free path into a room: the invite token is the secret, so no
 * session is required. The grant is deliberately minimal — publish + subscribe
 * to the invite's room, no recording — and the LiveKit identity is never a real
 * User.id, so the attendance/participation webhook (which resolves identities to
 * User rows) safely ignores guests.
 *
 * Personal invites map to a fixed identity `guest-<inviteId>`. A shareable "room
 * link" is reused by many people, so each joiner gets a unique identity
 * `guest-<inviteId>-<rand>` (a shared identity would make LiveKit evict all but
 * one) and supplies their own display `name`.
 *
 * GET /api/livekit/guest-token?token=<inviteToken>&name=<displayName>
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing invite token" }, { status: 400 });
  }

  const invite = await prisma.meetingInvite.findUnique({
    where: { token },
    select: {
      id: true,
      roomName: true,
      label: true,
      email: true,
      guestName: true,
      shareable: true,
      expiresAt: true,
      revokedAt: true,
    },
  });

  if (!invite) {
    return NextResponse.json({ error: "This invite link is not valid." }, { status: 404 });
  }
  if (invite.revokedAt) {
    return NextResponse.json({ error: "This invite has been revoked." }, { status: 403 });
  }
  if (invite.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "This invite link has expired." }, { status: 403 });
  }

  let cfg: ReturnType<typeof livekitConfig>;
  try {
    cfg = livekitConfig();
  } catch {
    return NextResponse.json({ error: "Video is not configured yet." }, { status: 503 });
  }

  // A shareable link is used by many people at once, so each joiner needs a
  // distinct identity (LiveKit evicts a second participant sharing an identity)
  // and brings their own display name via ?name=. Personal invites keep the
  // fixed identity + stored name.
  const displayName = url.searchParams.get("name")?.trim().slice(0, 60);
  const identity = invite.shareable
    ? `guest-${invite.id}-${randomBytes(6).toString("base64url")}`
    : `guest-${invite.id}`;
  const name = invite.shareable
    ? displayName || "Guest"
    : invite.guestName || invite.email || "Guest";

  const at = new AccessToken(cfg.apiKey, cfg.apiSecret, {
    identity,
    name,
    ttl: "2h",
  });
  at.addGrant({
    room: invite.roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  // Light usage trail: always bump lastJoinedAt; set firstJoinedAt only on the
  // very first join (updateMany with a null guard avoids a read-then-write race).
  const now = new Date();
  await prisma.meetingInvite.update({
    where: { id: invite.id },
    data: { lastJoinedAt: now },
  });
  await prisma.meetingInvite.updateMany({
    where: { id: invite.id, firstJoinedAt: null },
    data: { firstJoinedAt: now },
  });

  return NextResponse.json({
    token: await at.toJwt(),
    url: cfg.url,
    room: invite.roomName,
    label: invite.label,
    identity,
  });
}

import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { livekitConfig } from "@/lib/livekit";

/**
 * Mints a LiveKit token for an external guest from their invite token. This is
 * the ONLY login-free path into a room: the invite token is the secret, so no
 * session is required. The grant is deliberately minimal — publish + subscribe
 * to the invite's room, no recording — and the LiveKit identity is
 * `guest-<inviteId>`, which is not a real User.id, so the attendance/participation
 * webhook (which resolves identities to User rows) safely ignores guests.
 *
 * GET /api/livekit/guest-token?token=<inviteToken>
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
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

  const at = new AccessToken(cfg.apiKey, cfg.apiSecret, {
    identity: `guest-${invite.id}`,
    name: invite.guestName || invite.email,
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
    identity: `guest-${invite.id}`,
  });
}

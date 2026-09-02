import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { sendMeetingInvite } from "@/lib/email";
import {
  resolveInviteTarget,
  getOrCreateShareLink,
  inviteTtlHours,
  companySlugFromRoom,
  projectIdFromRoom,
  classSessionIdFromRoom,
  type InviteTarget,
} from "@/lib/livekit";

/**
 * Manage external-guest invites for a video meeting.
 *
 * POST   /api/livekit/invite   { email, guestName?, sessionId?|projectId?|company? }
 *          → creates a personal invite, emails the guest a login-free join link
 * POST   /api/livekit/invite   { shareable: true, sessionId?|projectId?|company? }
 *          → returns the reusable "room link" for that meeting (no email sent)
 * GET    /api/livekit/invite?sessionId=…|projectId=…|company=…
 *          → lists this meeting's invites (for the host to review / revoke)
 * DELETE /api/livekit/invite?id=…
 *          → revokes an invite (guest can no longer join)
 *
 * Creating/listing/revoking all require that the caller is staff with access to
 * the target room (resolveInviteTarget enforces this). The guest themselves uses
 * the token via the public /api/livekit/guest-token endpoint — never this one.
 */

/** Build an InviteTarget from query/body params (exactly one must be present). */
function targetFrom(params: {
  sessionId?: string | null;
  projectId?: string | null;
  company?: string | null;
}): InviteTarget | null {
  if (params.company) return { kind: "company", slug: params.company };
  if (params.projectId) return { kind: "project", id: params.projectId };
  if (params.sessionId) return { kind: "class", id: params.sessionId };
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    email?: string;
    guestName?: string;
    shareable?: boolean;
    sessionId?: string;
    projectId?: string;
    company?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const target = targetFrom(body);
  if (!target) {
    return NextResponse.json(
      { error: "Missing sessionId, projectId or company." },
      { status: 400 }
    );
  }

  // Shareable "room link" mode: no email, no send — just hand back the reusable
  // link for this meeting (find-or-create), which the host copies and shares.
  if (body.shareable) {
    const link = await getOrCreateShareLink(session.user, target);
    if (!link.ok) {
      return NextResponse.json({ error: link.error }, { status: link.status });
    }
    return NextResponse.json({
      shareable: true,
      joinUrl: `${site.url}/meet/guest/${link.token}`,
      label: link.label,
      expiresAt: link.expiresAt,
    });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const resolved = await resolveInviteTarget(session.user, target);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + inviteTtlHours() * 60 * 60 * 1000);

  const invite = await prisma.meetingInvite.create({
    data: {
      token,
      roomName: resolved.roomName,
      label: resolved.label,
      email,
      guestName: body.guestName?.trim() || null,
      expiresAt,
      createdById: session.user.id,
    },
    select: { id: true, email: true, guestName: true, expiresAt: true, createdAt: true },
  });

  // Best-effort email — never fail the request if SMTP hiccups; the host still
  // gets the invite row (and can copy the link from the list if needed).
  const joinUrl = `${site.url}/meet/guest/${token}`;
  try {
    await sendMeetingInvite({
      to: email,
      guestName: invite.guestName,
      meetingLabel: resolved.label,
      joinUrl,
      inviterName: session.user.name,
      expiresAt,
    });
  } catch (err) {
    console.error("meeting invite email failed", err);
  }

  return NextResponse.json({ invite: { ...invite, joinUrl } }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const target = targetFrom({
    sessionId: url.searchParams.get("sessionId"),
    projectId: url.searchParams.get("projectId"),
    company: url.searchParams.get("company"),
  });
  if (!target) {
    return NextResponse.json(
      { error: "Missing sessionId, projectId or company." },
      { status: 400 }
    );
  }

  const resolved = await resolveInviteTarget(session.user, target);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const invites = await prisma.meetingInvite.findMany({
    where: { roomName: resolved.roomName },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      guestName: true,
      expiresAt: true,
      revokedAt: true,
      lastJoinedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ invites });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing invite id." }, { status: 400 });
  }

  const invite = await prisma.meetingInvite.findUnique({
    where: { id },
    select: { roomName: true },
  });
  if (!invite) {
    return NextResponse.json({ error: "Invite not found." }, { status: 404 });
  }

  // Authorize against the room this invite belongs to — reverse-map the room
  // name to a target so the same access gate applies as when it was created.
  const target = targetFromRoom(invite.roomName);
  if (!target) {
    return NextResponse.json({ error: "Unsupported room." }, { status: 400 });
  }
  const resolved = await resolveInviteTarget(session.user, target);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  await prisma.meetingInvite.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

/** Reverse a stored room name (company-… / project-… / class-…) to a target. */
function targetFromRoom(room: string): InviteTarget | null {
  const company = companySlugFromRoom(room);
  if (company) return { kind: "company", slug: company };
  const project = projectIdFromRoom(room);
  if (project) return { kind: "project", id: project };
  const cls = classSessionIdFromRoom(room);
  if (cls) return { kind: "class", id: cls };
  return null;
}

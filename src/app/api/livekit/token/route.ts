import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { auth } from "@/lib/auth";
import {
  classSessionAccess,
  projectMeetingAccess,
  companyMeetingAccess,
  livekitConfig,
  roomForClassSession,
  roomForProject,
  roomForCompany,
} from "@/lib/livekit";

/**
 * Mints a short-lived LiveKit access token for a video room.
 *
 * GET /api/livekit/token?sessionId=<classSessionId>   → class call
 * GET /api/livekit/token?projectId=<projectId>        → project meeting
 *
 * Class access is gated by classSessionAccess() (enrolled student / assigned
 * instructor / academy admin); project access by project membership. The token
 * identity is the User.id so the webhook can attribute attendance / participation.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  const projectId = url.searchParams.get("projectId");
  const company = url.searchParams.get("company");

  let room: string;
  if (company) {
    const access = companyMeetingAccess(session.user, company);
    if (!access.exists) {
      return NextResponse.json({ error: "Unknown standup room" }, { status: 404 });
    }
    if (!access.ok) {
      return NextResponse.json({ error: "Staff only" }, { status: 403 });
    }
    room = roomForCompany(company);
  } else if (projectId) {
    const access = await projectMeetingAccess(session.user, projectId);
    if (!access.ok) {
      return NextResponse.json({ error: "No access to this project" }, { status: 403 });
    }
    room = roomForProject(projectId);
  } else if (sessionId) {
    const access = await classSessionAccess(session.user, sessionId);
    if (!access.ok) {
      return NextResponse.json({ error: "No access to this class" }, { status: 403 });
    }
    room = roomForClassSession(sessionId);
  } else {
    return NextResponse.json(
      { error: "Missing sessionId, projectId or company" },
      { status: 400 }
    );
  }

  let cfg: ReturnType<typeof livekitConfig>;
  try {
    cfg = livekitConfig();
  } catch {
    return NextResponse.json(
      { error: "Video is not configured yet." },
      { status: 503 }
    );
  }

  const at = new AccessToken(cfg.apiKey, cfg.apiSecret, {
    identity: session.user.id,
    name: session.user.name ?? undefined,
    // Short TTL: the client refetches if it needs to reconnect.
    ttl: "2h",
  });
  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return NextResponse.json({
    token: await at.toJwt(),
    url: cfg.url,
    room,
    identity: session.user.id,
  });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  projectMeetingAccess,
  projectLivePresence,
  type LivePresence,
} from "@/lib/livekit";

export const dynamic = "force-dynamic";

const MAX_IDS = 50;

/**
 * Live presence for project meeting rooms — powers the "N in call / Join"
 * indicator so members can see and jump into a meeting that's already running.
 *
 * GET /api/livekit/presence?projectId=<id>
 * GET /api/livekit/presence?projectIds=<id>,<id>,<id>
 *
 * Only returns presence for projects the caller is a member of (or SUPER_ADMIN);
 * others are silently omitted so this can't be used to probe project existence.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const single = url.searchParams.get("projectId");
  const many = url.searchParams.get("projectIds");
  const ids = Array.from(
    new Set(
      (single ? [single] : many ? many.split(",") : [])
        .map((s) => s.trim())
        .filter(Boolean)
    )
  ).slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json({ error: "Missing projectId(s)" }, { status: 400 });
  }

  const presence: Record<string, LivePresence> = {};
  await Promise.all(
    ids.map(async (id) => {
      const access = await projectMeetingAccess(session.user, id);
      if (!access.ok) return; // omit projects the caller can't see
      presence[id] = await projectLivePresence(id);
    })
  );

  return NextResponse.json({ presence });
}

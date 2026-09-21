import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canModerateRoom, muteParticipantMic } from "@/lib/livekit";

/**
 * In-call moderation: muting someone else's microphone.
 *
 * GET  /api/livekit/moderation?room=<roomName>
 *        → { canModerate }  — drives whether the mute control is offered at all
 * POST /api/livekit/moderation  { room, identity, muted }
 *        → { muted }
 *
 * The room is identified by its LiveKit room name (`class-…`, `project-…`,
 * `company-…`), which the client already holds; canModerateRoom() maps that back
 * to the underlying class/project/standup and applies the same bar as recording.
 * External guests join without a session, so they can never moderate.
 *
 * `muted` defaults to true, so an older client that posts only { room, identity }
 * still mutes. Unmuting is attempted but may come back 409 `unmute-blocked`:
 * LiveKit refuses a server-side unmute unless the deployment opts into it, and
 * the client then asks the participant to unmute themselves instead.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const room = new URL(req.url).searchParams.get("room");
  if (!room) {
    return NextResponse.json({ error: "Missing room." }, { status: 400 });
  }

  return NextResponse.json({
    canModerate: await canModerateRoom(session.user, room),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { room?: unknown; identity?: unknown; muted?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const room = typeof body.room === "string" ? body.room : null;
  const identity = typeof body.identity === "string" ? body.identity : null;
  const muted = body.muted === undefined ? true : body.muted === true;
  if (!room || !identity) {
    return NextResponse.json(
      { error: "room and identity are required." },
      { status: 400 }
    );
  }

  if (!(await canModerateRoom(session.user, room))) {
    return NextResponse.json(
      { error: "You can't mute people in this call." },
      { status: 403 }
    );
  }

  // Your own mic is the control bar's job: it owns the local track directly,
  // where this route can only ask the server to act on a published one.
  if (identity === session.user.id) {
    return NextResponse.json(
      { error: "Use your own mic button for your microphone." },
      { status: 400 }
    );
  }

  const result = await muteParticipantMic(room, identity, muted);
  if (result === "gone") {
    return NextResponse.json(
      { error: "They're no longer in the call, or have no mic on." },
      { status: 409 }
    );
  }
  if (result === "unmute-blocked") {
    return NextResponse.json(
      {
        code: "unmute-blocked",
        error: "Only they can turn their own mic back on.",
      },
      { status: 409 }
    );
  }
  if (result === "failed") {
    return NextResponse.json(
      { error: "Could not reach the call server." },
      { status: 502 }
    );
  }

  return NextResponse.json({ muted });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canModerateRoom, muteParticipantMic } from "@/lib/livekit";

/**
 * In-call moderation: muting someone else's microphone.
 *
 * GET  /api/livekit/moderation?room=<roomName>
 *        → { canModerate }  — drives whether the mute control is offered at all
 * POST /api/livekit/moderation  { room, identity }
 *        → { muted: true }
 *
 * The room is identified by its LiveKit room name (`class-…`, `project-…`,
 * `company-…`), which the client already holds; canModerateRoom() maps that back
 * to the underlying class/project/standup and applies the same bar as recording.
 * External guests join without a session, so they can never moderate.
 *
 * Mute only — there is no unmute action here. LiveKit does not let a server
 * unmute a published track, and that is the behaviour we want: a host can quiet
 * a hot mic, but only its owner can switch it back on.
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

  let body: { room?: unknown; identity?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const room = typeof body.room === "string" ? body.room : null;
  const identity = typeof body.identity === "string" ? body.identity : null;
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

  // Muting yourself is the mic button's job, and routing it through the admin
  // API would leave you unable to unmute from the server's point of view.
  if (identity === session.user.id) {
    return NextResponse.json(
      { error: "Use your own mic button to mute yourself." },
      { status: 400 }
    );
  }

  const muted = await muteParticipantMic(room, identity);
  if (!muted) {
    return NextResponse.json(
      { error: "They're no longer in the call, or have no mic on." },
      { status: 409 }
    );
  }

  return NextResponse.json({ muted: true });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteObject } from "@/lib/storage";
import {
  classSessionAccess,
  canRecordProject,
  stopRoomRecording,
} from "@/lib/livekit";

/**
 * Delete a recording — the DB row plus its object in the private R2 bucket.
 *
 * DELETE /api/livekit/recording/[id]
 *
 * Only users who could have recorded the room may delete: for a class the
 * assigned instructor / academy admin (not students), for a project the OWNER
 * or a super admin. If the egress is still running it's stopped first so we
 * don't orphan a live job.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { id } = await params;

  const recording = await prisma.recording.findUnique({
    where: { id },
    select: {
      egressId: true,
      status: true,
      storageKey: true,
      classSessionId: true,
      projectId: true,
    },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording not found." }, { status: 404 });
  }

  const canManage = recording.classSessionId
    ? await classSessionAccess(session.user, recording.classSessionId).then(
        (a) => a.ok && !a.isStudent
      )
    : recording.projectId
      ? await canRecordProject(session.user, recording.projectId)
      : false;
  if (!canManage) {
    return NextResponse.json(
      { error: "You can't delete this recording." },
      { status: 403 }
    );
  }

  // Stop a still-running job before deleting so egress doesn't keep writing.
  if (recording.status === "STARTING" || recording.status === "ACTIVE") {
    try {
      await stopRoomRecording(recording.egressId);
    } catch {
      /* best-effort — proceed with deletion regardless */
    }
  }

  // Remove the stored file (best-effort — deleteObject no-ops if unconfigured).
  if (recording.storageKey) {
    try {
      await deleteObject(recording.storageKey);
    } catch {
      /* leave the DB delete to proceed even if the object lingers */
    }
  }

  await prisma.recording.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

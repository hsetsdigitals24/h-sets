import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageCohort } from "@/lib/cohort-access";
import { prisma } from "@/lib/prisma";
import { presignDownload } from "@/lib/storage";

/**
 * Streams an assignment submission file via a presigned R2 URL. Accessible to
 * the submitting student and to staff (who grade it).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { assignment: { select: { cohortId: true } } },
  });
  if (!submission || !submission.r2Key)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStaff = session.user.role !== "STUDENT";
  if (!isStaff && submission.studentId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // Instructors may only download submissions for cohorts they're assigned to.
  if (isStaff && !(await canManageCohort(session.user, submission.assignment.cohortId)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const url = await presignDownload(submission.r2Key, submission.fileName ?? undefined);
    return NextResponse.redirect(url);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Storage error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveEnrollment } from "@/lib/lms";
import { presignDownload } from "@/lib/storage";

/**
 * Streams a learning material via a short-lived presigned R2 URL. Enrolled
 * students (and staff) only; the bucket itself is never public. External-link
 * materials redirect straight to their URL.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const material = await prisma.material.findUnique({
    where: { id },
    include: { lesson: { select: { module: { select: { cohortId: true } } } } },
  });
  if (!material) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStaff = session.user.role !== "STUDENT";
  if (!isStaff) {
    const enrolled = await getActiveEnrollment(session.user.id, material.lesson.module.cohortId);
    if (!enrolled) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (material.url) return NextResponse.redirect(material.url);
  if (!material.r2Key) return NextResponse.json({ error: "No file" }, { status: 404 });

  try {
    const url = await presignDownload(material.r2Key, material.title);
    return NextResponse.redirect(url);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Storage error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gradeExamAttempt } from "@/lib/lms";
import { isAttemptExpired, effectiveWindowEnd } from "@/lib/exams";

export const dynamic = "force-dynamic";

/**
 * Auto-closes exam attempts that have run past their deadline. Vercel Cron hits
 * this every minute (see vercel.json); it's the server-side safety net that
 * submits and grades an attempt even when the student's browser is gone.
 * Authenticated with the Bearer token Vercel Cron sends (`CRON_SECRET`).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const open = await prisma.examAttempt.findMany({
    where: { status: "in_progress" },
    select: {
      id: true,
      examId: true,
      studentId: true,
      startedAt: true,
      exam: { select: { durationMins: true, endAt: true } },
    },
    take: 500,
  });

  // An admin per-student window override extends the effective deadline, so a
  // reopened attempt must be judged against its student's override, not the
  // cohort window. Batch-fetch the relevant grants into a lookup.
  const grants = await prisma.examRetakeGrant.findMany({
    where: { OR: open.map((a) => ({ examId: a.examId, studentId: a.studentId })) },
    select: { examId: true, studentId: true, endAtOverride: true },
  });
  const overrideByKey = new Map(
    grants.map((g) => [`${g.examId}:${g.studentId}`, g.endAtOverride])
  );

  let closed = 0;
  for (const a of open) {
    const endAtOverride = overrideByKey.get(`${a.examId}:${a.studentId}`) ?? null;
    const effectiveEnd = effectiveWindowEnd(a.exam.endAt, { endAtOverride });
    if (!isAttemptExpired(a.startedAt, a.exam.durationMins, effectiveEnd)) continue;
    await gradeExamAttempt(a.id);
    closed += 1;
  }

  return NextResponse.json({ scanned: open.length, closed });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNurtureStep } from "@/lib/email";
import { logLeadEvent } from "@/lib/lead-events";
import {
  NURTURE_SEQUENCES,
  type NurtureSequenceKey,
} from "@/lib/nurture";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BATCH = 50;
const DAY_MS = 86_400_000;

/**
 * Nurture-sequence sender. Designed to be called on a schedule by an external
 * cron service (cron-job.org): GET /api/cron/nurture?token=<CRON_SECRET>.
 *
 * Each run sends the due step for up to BATCH active enrollments and advances
 * the cursor. Safe to run as often as hourly — steps only go out once their
 * scheduled `nextSendAt` has passed.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 }
    );
  }

  const url = new URL(req.url);
  const token =
    url.searchParams.get("token") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const now = new Date();
  const due = await prisma.nurtureEnrollment.findMany({
    where: { status: "active", nextSendAt: { lte: now } },
    include: { lead: { select: { name: true, email: true } } },
    take: BATCH,
  });

  let sent = 0;
  let completed = 0;

  for (const enrollment of due) {
    const steps = NURTURE_SEQUENCES[enrollment.sequence as NurtureSequenceKey];
    const step = steps?.[enrollment.step];

    // Sequence removed or cursor out of range — retire the enrollment.
    if (!steps || !step) {
      await prisma.nurtureEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "completed", nextSendAt: null },
      });
      completed++;
      continue;
    }

    // Send the current step (skip gracefully if we have no email on file).
    if (enrollment.lead.email) {
      try {
        await sendNurtureStep({
          to: enrollment.lead.email,
          name: enrollment.lead.name,
          subject: step.subject,
          body: step.body,
        });
        sent++;
        await logLeadEvent(enrollment.leadId, {
          type: "nurture_sent",
          message: `Nurture email sent: "${step.subject}" (${enrollment.sequence} step ${enrollment.step + 1}).`,
          meta: { sequence: enrollment.sequence, step: enrollment.step },
        });
      } catch (err) {
        // Leave the cursor untouched so the next run retries this step.
        console.error("[cron:nurture] send failed:", err);
        continue;
      }
    }

    // Advance the cursor: schedule the next step or complete the sequence.
    const nextStep = steps[enrollment.step + 1];
    if (nextStep) {
      await prisma.nurtureEnrollment.update({
        where: { id: enrollment.id },
        data: {
          step: enrollment.step + 1,
          lastSentAt: now,
          nextSendAt: new Date(now.getTime() + nextStep.dayOffset * DAY_MS),
        },
      });
    } else {
      await prisma.nurtureEnrollment.update({
        where: { id: enrollment.id },
        data: { status: "completed", lastSentAt: now, nextSendAt: null },
      });
      completed++;
    }
  }

  return NextResponse.json({
    ok: true,
    processed: due.length,
    sent,
    completed,
  });
}

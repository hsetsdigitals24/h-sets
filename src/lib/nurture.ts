// Marketing automation — email nurture sequences. Server-only.
//
// Sequence definitions (PRD §22.3) plus enrollment. A lead is enrolled at
// capture time (src/lib/db.ts); the external cron endpoint
// (/api/cron/nurture) sends due steps and advances the cursor.
//
// dayOffset is measured in days from enrollment. Step 0 with dayOffset 0 goes
// out on the next cron run after capture.

import "server-only";
import { prisma } from "@/lib/prisma";

export type NurtureStep = {
  dayOffset: number;
  subject: string;
  body: string; // inner HTML — wrapped by the email layout when sent
};

export type NurtureSequenceKey = "academy" | "business" | "post-consultation";

export const NURTURE_SEQUENCES: Record<NurtureSequenceKey, NurtureStep[]> = {
  // Academy Nurture — resource download → cohort enrollment.
  academy: [
    {
      dayOffset: 0,
      subject: "Welcome to H-SETS — your resource is inside",
      body: `<p>Thanks for downloading from H-SETS. We build practical, cohort-based tech training that gets people hired.</p><p>Over the next few days we'll share how our programmes work and how graduates land roles.</p>`,
    },
    {
      dayOffset: 2,
      subject: "How H-SETS programmes actually work",
      body: `<p>Our academy runs live, instructor-led cohorts with real projects, mentorship and a certificate on completion.</p><p><a href="https://h-sets.com/academy">Browse the programmes →</a></p>`,
    },
    {
      dayOffset: 5,
      subject: "From career-switcher to hired — a graduate story",
      body: `<p>See how one of our graduates went from an unrelated degree to a paid tech role after a single cohort.</p><p><a href="https://h-sets.com/academy">Read graduate stories →</a></p>`,
    },
    {
      dayOffset: 8,
      subject: "Seats are limited — join the next cohort",
      body: `<p>Cohorts fill up. If you're ready to start, secure your seat now.</p><p><a href="https://h-sets.com/academy">Apply to the next cohort →</a></p>`,
    },
  ],
  // Business Lead Nurture — enquiry → consultation booking.
  business: [
    {
      dayOffset: 0,
      subject: "Thanks for reaching out to H-SETS",
      body: `<p>Thanks for getting in touch. H-SETS is Nigeria's end-to-end technology growth partner — from websites and software to AI automation.</p><p>Here's a case study of how we've helped businesses like yours.</p><p><a href="https://h-sets.com/portfolio">See client results →</a></p>`,
    },
    {
      dayOffset: 3,
      subject: "Not sure where to start? Try our assessment",
      body: `<p>A quick self-assessment can pinpoint where technology will move the needle for your business.</p><p><a href="https://h-sets.com/contact">Talk to us →</a></p>`,
    },
    {
      dayOffset: 6,
      subject: "Book a free strategy session",
      body: `<p>Let's map out a plan together — no obligation. Grab a time that works for you.</p><p><a href="https://h-sets.com/contact#consultation">Book a free consultation →</a></p>`,
    },
  ],
  // Post-Consultation — booked call → proposal/next steps.
  "post-consultation": [
    {
      dayOffset: 0,
      subject: "Great speaking with you — next steps",
      body: `<p>Thanks for booking a consultation with H-SETS. We'll follow up with a summary and recommended next steps.</p><p>In the meantime, feel free to reply with anything else on your mind.</p>`,
    },
    {
      dayOffset: 3,
      subject: "Your H-SETS proposal",
      body: `<p>We'd love to put together a tailored proposal for your project. Reply to let us know you're ready and we'll get it over to you.</p>`,
    },
    {
      dayOffset: 7,
      subject: "Checking in",
      body: `<p>Just checking in on your project. Happy to answer any questions or adjust scope — we're here when you're ready.</p>`,
    },
  ],
};

type LeadShape = {
  type: string;
  source?: string | null;
  data?: Record<string, unknown> | null;
};

/** Pick the nurture sequence for a freshly-captured lead, or null for none. */
export function sequenceForLead(lead: LeadShape): NurtureSequenceKey | null {
  switch (lead.type) {
    case "resource":
      return "academy";
    case "contact":
      return "business";
    case "consultation":
      return "post-consultation";
    default:
      return null; // newsletter etc. — no automated sequence
  }
}

/** Enroll a lead into a sequence, scheduling step 0. Best-effort, idempotent. */
export async function enrollInNurture(
  leadId: bigint | number,
  sequence: NurtureSequenceKey
): Promise<void> {
  const steps = NURTURE_SEQUENCES[sequence];
  if (!steps || steps.length === 0) return;
  const nextSendAt = new Date(Date.now() + steps[0].dayOffset * 86_400_000);
  try {
    await prisma.nurtureEnrollment.upsert({
      where: { leadId_sequence: { leadId: BigInt(leadId), sequence } },
      create: { leadId: BigInt(leadId), sequence, step: 0, nextSendAt },
      update: {}, // already enrolled — leave the existing cursor untouched
    });
  } catch (err) {
    console.error("[nurture] enrollInNurture failed:", err);
  }
}

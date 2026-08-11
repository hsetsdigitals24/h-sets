import { createPostHandler } from "@/lib/api-handler";
import { consultationSchema } from "@/lib/schemas";
import { insertLead } from "@/lib/db";
import { notifyNewLead, sendConsultationConfirmation } from "@/lib/email";
import { notifyRole } from "@/lib/notifications";

export const runtime = "nodejs";

/** Session id → human label + duration (mirrors the booking form). */
const SESSIONS: Record<string, { label: string; mins: number }> = {
  discovery: { label: "Discovery Call", mins: 30 },
  strategy: { label: "Strategy Session", mins: 60 },
  ai: { label: "AI Consultation", mins: 45 },
  academy: { label: "Academy Guidance Call", mins: 20 },
};

export const POST = createPostHandler(consultationSchema, async (data) => {
  const { id } = await insertLead({
    type: "consultation",
    name: data.name,
    email: data.email,
    phone: data.phone,
    company: data.company,
    source: "consultation-booking",
    data: {
      session: data.session,
      day: data.day,
      slot: data.slot,
      notes: data.notes,
    },
  });

  const meta = SESSIONS[data.session] ?? { label: data.session, mins: 30 };
  const when = `${new Date(data.day).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })} at ${data.slot}`;
  // Slots are Nigeria local time (WAT, UTC+1) — anchor the invite accordingly.
  const start = new Date(`${data.day}T${data.slot}:00+01:00`);

  // Internal team notification.
  await notifyNewLead({
    type: "consultation",
    subject: `New consultation: ${meta.label} — ${when}`,
    fields: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      session: meta.label,
      when,
      notes: data.notes,
    },
  });

  // Confirmation to the prospect, with an actual calendar invite (.ics + link).
  await sendConsultationConfirmation({
    to: data.email,
    name: data.name,
    sessionLabel: meta.label,
    whenLabel: when,
    start,
    durationMins: meta.mins,
  });

  await notifyRole("SALES_ADMIN", {
    type: "consultation",
    title: `New consultation: ${data.session}`,
    body: `${data.name} booked for ${when}.`,
    link: "/admin/leads",
  });

  return { message: "Consultation booked", data: { id } };
});

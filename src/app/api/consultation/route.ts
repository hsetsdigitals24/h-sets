import { createPostHandler } from "@/lib/api-handler";
import { consultationSchema } from "@/lib/schemas";
import { insertLead } from "@/lib/db";
import { notifyNewLead } from "@/lib/email";
import { notifyRole } from "@/lib/notifications";

export const runtime = "nodejs";

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

  const when = `${new Date(data.day).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })} at ${data.slot}`;

  await notifyNewLead({
    type: "consultation",
    subject: `New consultation: ${data.session} — ${when}`,
    fields: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      session: data.session,
      when,
      notes: data.notes,
    },
    userEmail: data.email,
    userName: data.name,
    confirmation: {
      subject: "Your H-SETS consultation is booked",
      body: `<p>Your <strong>${data.session}</strong> consultation is confirmed for <strong>${when}</strong>.</p><p>We've added it to our calendar and will send a reminder before the call.</p>`,
    },
  });

  await notifyRole("SALES_ADMIN", {
    type: "consultation",
    title: `New consultation: ${data.session}`,
    body: `${data.name} booked for ${when}.`,
    link: "/admin/leads",
  });

  return { message: "Consultation booked", data: { id } };
});

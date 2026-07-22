import { createPostHandler } from "@/lib/api-handler";
import { contactSchema } from "@/lib/schemas";
import { insertLead } from "@/lib/db";
import { notifyNewLead } from "@/lib/email";
import { notifyRole } from "@/lib/notifications";

export const runtime = "nodejs";

export const POST = createPostHandler(contactSchema, async (data) => {
  const { id } = await insertLead({
    type: "contact",
    name: data.name,
    email: data.email,
    company: data.company,
    source: "contact-form",
    data: { topic: data.topic, message: data.message },
  });

  await notifyNewLead({
    type: "contact",
    subject: `New enquiry: ${data.topic}`,
    fields: {
      name: data.name,
      email: data.email,
      company: data.company,
      topic: data.topic,
      message: data.message,
    },
    userEmail: data.email,
    userName: data.name,
    confirmation: {
      subject: "We received your message — H-SETS",
      body: "<p>Thanks for reaching out to H-SETS. A member of our team will get back to you within one business day.</p>",
    },
  });

  await notifyRole("SALES_ADMIN", {
    type: "lead",
    title: `New enquiry: ${data.topic}`,
    body: `${data.name} sent a message via the contact form.`,
    link: "/admin/leads",
  });

  return { message: "Message received", data: { id } };
});

import { createPostHandler } from "@/lib/api-handler";
import { newsletterSchema } from "@/lib/schemas";
import { insertLead } from "@/lib/db";
import { notifyNewLead } from "@/lib/email";

export const runtime = "nodejs";

export const POST = createPostHandler(newsletterSchema, async (data) => {
  const { id } = await insertLead({
    type: "newsletter",
    email: data.email,
    source: "newsletter",
  });

  await notifyNewLead({
    type: "newsletter",
    subject: `New newsletter signup: ${data.email}`,
    fields: { email: data.email },
    userEmail: data.email,
    confirmation: {
      subject: "You're subscribed — H-SETS",
      body: "<p>Thanks for subscribing to H-SETS insights. We'll send practical perspectives on technology and career growth straight to your inbox — no spam, ever.</p>",
    },
  });

  return { message: "Subscribed", data: { id } };
});

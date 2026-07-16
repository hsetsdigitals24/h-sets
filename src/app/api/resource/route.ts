import { createPostHandler } from "@/lib/api-handler";
import { resourceSchema } from "@/lib/schemas";
import { insertLead } from "@/lib/db";
import { notifyNewLead } from "@/lib/email";

export const runtime = "nodejs";

export const POST = createPostHandler(resourceSchema, async (data) => {
  const { id } = await insertLead({
    type: "resource",
    name: data.name,
    email: data.email,
    company: data.company,
    source: `resource:${data.resourceId}`,
    data: {
      resourceId: data.resourceId,
      resourceTitle: data.resourceTitle,
      role: data.role,
      phone: data.phone,
    },
  });

  await notifyNewLead({
    type: "resource",
    subject: `Resource download: ${data.resourceTitle}`,
    fields: {
      resource: data.resourceTitle,
      name: data.name,
      email: data.email,
      company: data.company,
      role: data.role,
      phone: data.phone,
    },
    userEmail: data.email,
    userName: data.name,
    confirmation: {
      subject: `Your download: ${data.resourceTitle}`,
      body: `<p>Thanks for your interest! Here's your copy of <strong>${data.resourceTitle}</strong>. In a production setup this email would include your secure download link.</p>`,
    },
  });

  return { message: "Sent", data: { id } };
});

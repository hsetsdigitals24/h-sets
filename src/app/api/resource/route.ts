import { createPostHandler } from "@/lib/api-handler";
import { resourceSchema } from "@/lib/schemas";
import { insertLead } from "@/lib/db";
import { notifyNewLead } from "@/lib/email";
import { notifyRole } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export const POST = createPostHandler(resourceSchema, async (data) => {
  const resource = await prisma.resource.findUnique({
    where: { slug: data.resourceId },
    select: { fileUrl: true },
  });

  const confirmationBody = resource?.fileUrl
    ? `<p>Thanks for your interest! Here's your copy of <strong>${data.resourceTitle}</strong>.</p><p><a href="${resource.fileUrl}">Download ${data.resourceTitle}</a></p>`
    : `<p>Thanks for your interest! Here's your copy of <strong>${data.resourceTitle}</strong>. We'll be in touch with your download link shortly.</p>`;

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
      body: confirmationBody,
    },
  });

  await notifyRole("SALES_ADMIN", {
    type: "lead",
    title: `Resource download: ${data.resourceTitle}`,
    body: `${data.name} downloaded a gated resource.`,
    link: "/admin/leads",
  });

  return { message: "Sent", data: { id } };
});

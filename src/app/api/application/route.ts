import { createPostHandler } from "@/lib/api-handler";
import { applicationSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { notifyNewLead } from "@/lib/email";
import { notifyRole } from "@/lib/notifications";

export const runtime = "nodejs";

export const POST = createPostHandler(applicationSchema, async (data) => {
  const cohort = await prisma.cohort.findUnique({
    where: { id: data.cohortId },
    include: { programme: { select: { name: true } } },
  });
  if (!cohort) {
    throw new Error("Cohort not found");
  }

  const application = await prisma.application.create({
    data: {
      cohortId: data.cohortId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      background: data.background,
      motivation: data.motivation,
    },
  });

  await notifyNewLead({
    type: "application",
    subject: `New application: ${cohort.programme.name}`,
    fields: {
      name: data.name,
      email: data.email,
      phone: data.phone ?? "—",
      cohort: `${cohort.programme.name} (starts ${cohort.startDate})`,
      background: data.background,
      motivation: data.motivation,
    },
    userEmail: data.email,
    userName: data.name,
    confirmation: {
      subject: `We received your application — ${cohort.programme.name}`,
      body: `<p>Thanks for applying to the <strong>${cohort.programme.name}</strong> cohort at H-SETS Academy.</p>
        <p>Our admissions team will review your application and get back to you by email with the outcome. If you're accepted, you'll receive a link to set up your student account and complete enrollment.</p>`,
    },
  });

  await notifyRole("ACADEMY_ADMIN", {
    type: "application",
    title: `New application — ${cohort.programme.name}`,
    body: `${data.name} applied. Review it in Applications.`,
    link: "/admin/applications",
  });

  return { message: "Application received", data: { id: application.id } };
});

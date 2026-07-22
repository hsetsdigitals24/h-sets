import { createPostHandler } from "@/lib/api-handler";
import { jobApplicationSchema } from "@/lib/schemas";
import { prisma } from "@/lib/prisma";
import { notifyNewLead } from "@/lib/email";
import { notifyRole } from "@/lib/notifications";

export const runtime = "nodejs";

export const POST = createPostHandler(jobApplicationSchema, async (data) => {
  const job = await prisma.job.findFirst({
    where: { id: data.jobId, published: true },
    select: { id: true, title: true, company: true },
  });
  if (!job) {
    throw new Error("Job not found");
  }

  const application = await prisma.jobApplication.create({
    data: {
      jobId: job.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      coverNote: data.coverNote,
      cvKey: data.cvKey,
      cvFileName: data.cvFileName,
    },
  });

  await notifyNewLead({
    type: "job-application",
    subject: `New job application: ${job.title} @ ${job.company}`,
    fields: {
      name: data.name,
      email: data.email,
      phone: data.phone ?? "—",
      role: `${job.title} — ${job.company}`,
      cv: data.cvFileName ?? "—",
      coverNote: data.coverNote,
    },
    userEmail: data.email,
    userName: data.name,
    confirmation: {
      subject: `We received your application — ${job.title}`,
      body: `<p>Thanks for applying to the <strong>${job.title}</strong> role at ${job.company} via the H-SETS job board.</p>
        <p>Your application has been shared with our careers team. If there's a fit, we'll reach out by email with next steps.</p>`,
    },
  });

  await notifyRole("ACADEMY_ADMIN", {
    type: "job-application",
    title: `New job application — ${job.title}`,
    body: `${data.name} applied. Review it in Job Applications.`,
    link: "/admin/job-applications",
  });

  return { message: "Application received", data: { id: application.id } };
});

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { presignDownload } from "@/lib/storage";
import { notifyNewLead } from "@/lib/email";

/** Mark a job application as reviewed (optionally with an internal note). */
export async function markReviewed(
  formData: FormData
): Promise<{ error?: string } | void> {
  await requireSection("job-applications");
  const id = formData.get("id");
  const note = formData.get("reviewNote");
  if (typeof id !== "string") return { error: "Missing application id." };

  const application = await prisma.jobApplication.findUnique({ where: { id } });
  if (!application) return { error: "Application not found." };

  await prisma.jobApplication.update({
    where: { id },
    data: {
      status: "reviewed",
      reviewedAt: new Date(),
      reviewNote: typeof note === "string" && note.trim() ? note.trim() : null,
    },
  });

  revalidatePath("/admin/job-applications");
}

/** Reject a job application with an optional note, and email the applicant. */
export async function rejectJobApplication(
  formData: FormData
): Promise<{ error?: string } | void> {
  await requireSection("job-applications");
  const id = formData.get("id");
  const note = formData.get("reviewNote");
  if (typeof id !== "string") return { error: "Missing application id." };

  const application = await prisma.jobApplication.findUnique({
    where: { id },
    include: { job: { select: { title: true, company: true } } },
  });
  if (!application) return { error: "Application not found." };

  await prisma.jobApplication.update({
    where: { id },
    data: {
      status: "rejected",
      reviewedAt: new Date(),
      reviewNote: typeof note === "string" && note.trim() ? note.trim() : null,
    },
  });

  await notifyNewLead({
    type: "job-application-rejected",
    subject: `Job application rejected — ${application.job.title}`,
    fields: { applicant: application.name, email: application.email },
    userEmail: application.email,
    userName: application.name,
    confirmation: {
      subject: `Update on your application — ${application.job.title}`,
      body: `<p>Thank you for applying to the <strong>${application.job.title}</strong> role at ${application.job.company} via the H-SETS job board.</p>
        <p>After review, we won't be moving forward with your application on this occasion. We wish you the very best in your search.</p>`,
    },
  });

  revalidatePath("/admin/job-applications");
}

/** Return a short-lived signed URL to download an applicant's CV. */
export async function getCvDownloadUrl(
  id: string
): Promise<{ url: string } | { error: string }> {
  await requireSection("job-applications");
  const application = await prisma.jobApplication.findUnique({
    where: { id },
    select: { cvKey: true, cvFileName: true },
  });
  if (!application?.cvKey) return { error: "No CV attached." };
  try {
    const url = await presignDownload(application.cvKey, application.cvFileName ?? undefined);
    return { url };
  } catch {
    return { error: "Couldn't generate a download link." };
  }
}

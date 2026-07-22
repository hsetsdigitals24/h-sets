"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { createResetToken } from "@/lib/password-reset";
import { notifyNewLead } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

async function baseUrl(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

/**
 * Approve an application: create or link a STUDENT account, enroll them in the
 * cohort, and email them an acceptance (with a set-password link for brand-new
 * accounts). Idempotent-ish: guards against re-approving.
 */
export async function approveApplication(
  formData: FormData
): Promise<{ error?: string } | void> {
  await requireSection("applications");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing application id." };

  const application = await prisma.application.findUnique({
    where: { id },
    include: { cohort: { include: { programme: { select: { name: true } } } } },
  });
  if (!application) return { error: "Application not found." };
  if (application.status !== "pending") {
    return { error: "This application has already been reviewed." };
  }

  // Create or link the student account.
  let student = await prisma.user.findUnique({ where: { email: application.email } });
  let isNewAccount = false;
  if (!student) {
    const passwordHash = await bcrypt.hash(randomBytes(24).toString("hex"), 12);
    student = await prisma.user.create({
      data: {
        name: application.name,
        email: application.email,
        role: "STUDENT",
        passwordHash,
      },
    });
    isNewAccount = true;
  } else if (student.role !== "STUDENT") {
    return { error: "That email belongs to a staff account and can't be enrolled as a student." };
  }

  // Enroll them (ignore if already enrolled).
  try {
    await prisma.enrollment.create({
      data: { studentId: student.id, cohortId: application.cohortId, status: "active" },
    });
    // Best-effort seat decrement.
    await prisma.cohort.updateMany({
      where: { id: application.cohortId, seatsLeft: { gt: 0 } },
      data: { seatsLeft: { decrement: 1 } },
    });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) {
      throw e;
    }
  }

  await prisma.application.update({
    where: { id },
    data: { status: "approved", reviewedAt: new Date(), studentId: student.id },
  });

  // Acceptance email.
  let setupBody = `<p>You can sign in to your student portal to get started.</p>`;
  if (isNewAccount) {
    const token = await createResetToken(student.email);
    const url = `${await baseUrl()}/reset-password?token=${token}&email=${encodeURIComponent(
      student.email
    )}`;
    setupBody = `<p>We've created your student account. Set your password to get started:</p>
      <p><a href="${url}">${url}</a></p>
      <p>This link expires in one hour — you can request a new one from the sign-in page if it lapses.</p>`;
  }

  await notifyNewLead({
    type: "application-approved",
    subject: `Application approved — ${application.cohort.programme.name}`,
    fields: { student: application.name, email: application.email, cohort: application.cohort.programme.name },
    userEmail: application.email,
    userName: application.name,
    confirmation: {
      subject: `🎉 You're in — ${application.cohort.programme.name}`,
      body: `<p>Congratulations! Your application to the <strong>${application.cohort.programme.name}</strong> cohort has been accepted.</p>${setupBody}`,
    },
  });

  await createNotification(student.id, {
    type: "application",
    title: `You're in — ${application.cohort.programme.name}`,
    body: "Your application has been approved. Open your dashboard to get started.",
    link: "/account",
  });

  revalidatePath("/admin/applications");
  revalidatePath("/admin/enrollments");
}

/** Reject an application with an optional note, and notify the applicant. */
export async function rejectApplication(
  formData: FormData
): Promise<{ error?: string } | void> {
  await requireSection("applications");
  const id = formData.get("id");
  const note = formData.get("reviewNote");
  if (typeof id !== "string") return { error: "Missing application id." };

  const application = await prisma.application.findUnique({
    where: { id },
    include: { cohort: { include: { programme: { select: { name: true } } } } },
  });
  if (!application) return { error: "Application not found." };
  if (application.status !== "pending") {
    return { error: "This application has already been reviewed." };
  }

  await prisma.application.update({
    where: { id },
    data: {
      status: "rejected",
      reviewedAt: new Date(),
      reviewNote: typeof note === "string" && note.trim() ? note.trim() : null,
    },
  });

  await notifyNewLead({
    type: "application-rejected",
    subject: `Application rejected — ${application.cohort.programme.name}`,
    fields: { student: application.name, email: application.email },
    userEmail: application.email,
    userName: application.name,
    confirmation: {
      subject: `Update on your H-SETS application`,
      body: `<p>Thank you for applying to the <strong>${application.cohort.programme.name}</strong> cohort. After review, we're unable to offer you a place in this intake.</p>
        <p>We'd encourage you to apply again for a future cohort. If you'd like feedback, just reply to this email.</p>`,
    },
  });

  // Only applicants with an existing account can receive an in-app notice.
  if (application.studentId) {
    await createNotification(application.studentId, {
      type: "application",
      title: `Update on your ${application.cohort.programme.name} application`,
      body: "After review, we're unable to offer you a place in this intake.",
      link: "/academy",
    });
  }

  revalidatePath("/admin/applications");
}

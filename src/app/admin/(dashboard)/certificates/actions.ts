"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { certificateEligibility } from "@/lib/lms";
import { generateCertId, verifyUrl } from "@/lib/certificate";
import { notifyNewLead } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

/**
 * Issue a certificate to a student for a cohort. Eligibility (attendance,
 * assignments, pass score) is enforced unless `override` is set — per PRD §8.1
 * admins may waive requirements.
 */
export async function issueCertificate(formData: FormData): Promise<{ error?: string } | void> {
  await requireSection("certificates");
  const cohortId = formData.get("cohortId");
  const studentId = formData.get("studentId");
  const override = formData.get("override") === "true";
  if (typeof cohortId !== "string" || typeof studentId !== "string") return { error: "Missing data." };

  if (!override) {
    const elig = await certificateEligibility(studentId, cohortId);
    if (!elig.eligible) {
      return { error: "Student is not yet eligible. Use override to issue anyway." };
    }
  }

  const [student, cohort] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId }, select: { name: true, email: true } }),
    prisma.cohort.findUnique({
      where: { id: cohortId },
      include: { programme: { select: { name: true } } },
    }),
  ]);
  if (!student || !cohort) return { error: "Student or cohort not found." };

  let certId = generateCertId();
  try {
    // Retry once on the astronomically unlikely certId collision.
    try {
      await prisma.certificate.create({ data: { certId, studentId, cohortId } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        // Could be a duplicate certId OR an existing cert for this student+cohort.
        const existing = await prisma.certificate.findUnique({
          where: { studentId_cohortId: { studentId, cohortId } },
        });
        if (existing) return { error: "This student already has a certificate for this cohort." };
        certId = generateCertId();
        await prisma.certificate.create({ data: { certId, studentId, cohortId } });
      } else {
        throw e;
      }
    }
  } catch (e) {
    throw e;
  }

  await prisma.enrollment
    .updateMany({ where: { studentId, cohortId }, data: { status: "completed" } })
    .catch(() => {});

  await notifyNewLead({
    type: "certificate",
    subject: `Certificate issued — ${cohort.programme.name}`,
    fields: { student: student.name, programme: cohort.programme.name, certId },
    userEmail: student.email,
    userName: student.name,
    confirmation: {
      subject: `🎓 Your H-SETS certificate for ${cohort.programme.name}`,
      body: `<p>Congratulations! Your certificate for <strong>${cohort.programme.name}</strong> has been issued.</p>
        <p>Certificate ID: <strong>${certId}</strong></p>
        <p>Download it from your student portal, or verify it any time at <a href="${verifyUrl(certId)}">${verifyUrl(certId)}</a>.</p>`,
    },
  });

  await createNotification(studentId, {
    type: "certificate",
    title: `🎓 Certificate issued — ${cohort.programme.name}`,
    body: `Your certificate (ID ${certId}) is ready to download.`,
    link: "/account/certificates",
  });

  revalidatePath("/admin/certificates");
  revalidatePath("/account/certificates");
}

export async function setCertificateRevoked(formData: FormData): Promise<{ error?: string } | void> {
  await requireSection("certificates");
  const id = formData.get("id");
  const revoked = formData.get("revoked") === "true";
  if (typeof id !== "string") return { error: "Missing id." };

  const cert = await prisma.certificate.update({
    where: { id },
    data: { revoked },
    include: { student: { select: { name: true, email: true } }, cohort: { include: { programme: { select: { name: true } } } } },
  });

  if (revoked) {
    await notifyNewLead({
      type: "certificate-revoked",
      subject: `Certificate revoked — ${cert.cohort.programme.name}`,
      fields: { student: cert.student.name, certId: cert.certId },
      userEmail: cert.student.email,
      userName: cert.student.name,
      confirmation: {
        subject: `Your H-SETS certificate has been revoked`,
        body: `<p>Your certificate (ID ${cert.certId}) for ${cert.cohort.programme.name} has been revoked. Contact us if you believe this is an error.</p>`,
      },
    });
    await createNotification(cert.studentId, {
      type: "certificate",
      title: "Your certificate has been revoked",
      body: `Certificate ${cert.certId} for ${cert.cohort.programme.name} is no longer valid.`,
      link: "/account/certificates",
    });
  }

  revalidatePath("/admin/certificates");
  revalidatePath("/account/certificates");
}

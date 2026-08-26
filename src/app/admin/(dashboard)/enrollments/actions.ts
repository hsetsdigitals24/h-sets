"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import type { ContentActionState } from "@/lib/content-forms";

const enrollSchema = z.object({
  cohortId: z.string().min(1, "Pick a cohort"),
  email: z.string().email("Enter a valid student email"),
});

/** State for the "add a new student" form — carries back the created login
 * details so the admin can hand them to the student. */
export type AddStudentState = ContentActionState & {
  credentials?: { name: string; email: string; password: string };
};

const addStudentSchema = z.object({
  cohortId: z.string().min(1, "Pick a cohort"),
  name: z.string().trim().min(1, "Enter the student's name").max(100),
  email: z.string().email("Enter a valid student email"),
  // Optional custom password; blank means auto-generate one.
  password: z
    .string()
    .transform((v) => v.trim())
    .refine((v) => v === "" || v.length >= 8, "Password must be at least 8 characters"),
});

/** A readable temporary password: uppercase prefix, hex body, trailing digit —
 * always ≥8 chars with a capital letter and a number. */
function generatePassword(): string {
  return "Hs" + randomBytes(4).toString("hex") + Math.floor(Math.random() * 10);
}

/**
 * Manually create a brand-new STUDENT account and enroll it into a cohort in
 * one step, with default login details the admin can pass on. The student can
 * change the password from their dashboard afterwards (Account → Security).
 */
export async function addNewStudent(
  _prev: AddStudentState,
  formData: FormData
): Promise<AddStudentState> {
  await requireSection("enrollments");
  const parsed = addStudentSchema.safeParse({
    cohortId: formData.get("cohortId"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return {
      error:
        "An account with that email already exists. Use \"Enroll a student\" above to add them to this cohort.",
    };
  }

  const password = parsed.data.password || generatePassword();
  const passwordHash = await bcrypt.hash(password, 12);

  // Create the account first (bcrypt is slow), then enroll + consume a seat
  // atomically so a failure can't leave the student without a seat reserved.
  const student = await prisma.user.create({
    data: { name: parsed.data.name, email, role: "STUDENT", passwordHash },
  });

  await prisma.$transaction(async (tx) => {
    await tx.enrollment.create({
      data: { studentId: student.id, cohortId: parsed.data.cohortId, status: "active" },
    });
    await tx.cohort.updateMany({
      where: { id: parsed.data.cohortId, seatsLeft: { gt: 0 } },
      data: { seatsLeft: { decrement: 1 } },
    });
  });

  const cohort = await prisma.cohort.findUnique({
    where: { id: parsed.data.cohortId },
    include: { programme: { select: { name: true } } },
  });
  await createNotification(student.id, {
    type: "enrollment",
    title: `Welcome to H-SETS Academy${cohort ? ` — ${cohort.programme.name}` : ""}`,
    body: "You've been enrolled. Please change your password from Account → Security.",
    link: "/account/security",
  });

  revalidatePath("/admin/enrollments");
  return { ok: true, credentials: { name: parsed.data.name, email, password } };
}

export async function enrollStudent(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("enrollments");
  const parsed = enrollSchema.safeParse({
    cohortId: formData.get("cohortId"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const student = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!student) return { error: "No account found with that email. Ask them to register first." };
  if (student.role !== "STUDENT") return { error: "That account is a staff account, not a student." };

  try {
    await prisma.enrollment.create({
      data: { studentId: student.id, cohortId: parsed.data.cohortId, status: "active" },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "That student is already enrolled in this cohort." };
    }
    throw e;
  }

  const cohort = await prisma.cohort.findUnique({
    where: { id: parsed.data.cohortId },
    include: { programme: { select: { name: true } } },
  });
  await createNotification(student.id, {
    type: "enrollment",
    title: `You've been enrolled${cohort ? ` — ${cohort.programme.name}` : ""}`,
    body: "You now have access to this cohort in your student portal.",
    link: "/account",
  });

  revalidatePath("/admin/enrollments");
  return { ok: true };
}

export async function withdrawEnrollment(formData: FormData): Promise<{ error?: string } | void> {
  await requireSection("enrollments");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.enrollment.delete({ where: { id } });
  revalidatePath("/admin/enrollments");
}

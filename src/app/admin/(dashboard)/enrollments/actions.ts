"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import type { ContentActionState } from "@/lib/content-forms";

const enrollSchema = z.object({
  cohortId: z.string().min(1, "Pick a cohort"),
  email: z.string().email("Enter a valid student email"),
});

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

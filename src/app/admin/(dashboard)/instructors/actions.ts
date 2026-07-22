"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import type { ContentActionState } from "@/lib/content-forms";

const baseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(10, "Bio is required"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  email: z.string().email("Enter a valid email"),
});

// On create a password is required; on update it is optional (blank = keep).
const createSchema = baseSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});
const updateSchema = baseSchema.extend({
  password: z.union([z.literal(""), z.string().min(8, "Password must be at least 8 characters")]),
});

function read(formData: FormData, schema: typeof createSchema | typeof updateSchema) {
  return schema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
    bio: formData.get("bio"),
    sortOrder: formData.get("sortOrder") ?? 0,
    email: formData.get("email"),
    password: formData.get("password") ?? "",
  });
}

function revalidateAll() {
  revalidatePath("/admin/instructors");
  revalidatePath("/admin/cohorts");
  revalidatePath("/admin/users");
  revalidatePath("/academy");
}

const EMAIL_TAKEN = "A user with that email already exists.";

function isEmailConflict(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

export async function createInstructor(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("instructors");
  const parsed = read(formData, createSchema);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, title, bio, sortOrder, email, password } = parsed.data;

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await prisma.instructor.create({
      data: {
        name,
        title,
        bio,
        sortOrder,
        user: { create: { name, email, role: Role.INSTRUCTOR, passwordHash } },
      },
    });
  } catch (e) {
    if (isEmailConflict(e)) return { error: EMAIL_TAKEN };
    throw e;
  }
  revalidateAll();
  redirect("/admin/instructors");
}

export async function updateInstructor(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("instructors");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const parsed = read(formData, updateSchema);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { name, title, bio, sortOrder, email, password } = parsed.data;

  const existing = await prisma.instructor.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!existing) return { error: "Instructor not found." };

  try {
    if (existing.userId) {
      // Sync the linked login account (mirror name, update email, optional password).
      const userData: Prisma.UserUpdateInput = { name, email };
      if (password) userData.passwordHash = await bcrypt.hash(password, 12);
      await prisma.$transaction([
        prisma.instructor.update({ where: { id }, data: { name, title, bio, sortOrder } }),
        prisma.user.update({ where: { id: existing.userId }, data: userData }),
      ]);
    } else {
      // Legacy instructor with no login account — provision one now.
      if (!password) return { error: "Set a password to create this instructor's login account." };
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.instructor.update({
        where: { id },
        data: {
          name,
          title,
          bio,
          sortOrder,
          user: { create: { name, email, role: Role.INSTRUCTOR, passwordHash } },
        },
      });
    }
  } catch (e) {
    if (isEmailConflict(e)) return { error: EMAIL_TAKEN };
    throw e;
  }
  revalidateAll();
  redirect("/admin/instructors");
}

export async function deleteInstructor(formData: FormData) {
  await requireSection("instructors");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const existing = await prisma.instructor.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!existing) return;
  // Deleting the User cascades to the Instructor content profile. Programme
  // links are onDelete: SetNull, so linked programmes are unlinked, not deleted.
  if (existing.userId) {
    await prisma.user.delete({ where: { id: existing.userId } });
  } else {
    await prisma.instructor.delete({ where: { id } });
  }
  revalidateAll();
}

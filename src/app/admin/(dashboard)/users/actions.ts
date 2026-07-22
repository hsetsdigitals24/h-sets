"use server";

import { revalidatePath } from "next/cache";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection, requireUser } from "@/lib/auth";
import { ensureInstructorProfile } from "@/lib/instructors";
import type { ContentActionState } from "@/lib/content-forms";

const ROLE_VALUES = Object.values(Role) as [Role, ...Role[]];
// Admin-assignable roles only — STUDENT is a public/self-service role.
const ADMIN_ROLE_VALUES = ROLE_VALUES.filter((r) => r !== Role.STUDENT) as [Role, ...Role[]];

const createSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(ADMIN_ROLE_VALUES),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // Optional instructor profile fields, only used when role is INSTRUCTOR.
  title: z.string().optional(),
  bio: z.string().optional(),
});

export async function createUser(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("users");
  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
    title: formData.get("title") ?? undefined,
    bio: formData.get("bio") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        passwordHash,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "A user with that email already exists." };
    }
    throw e;
  }
  // Instructors must have a content profile to be selectable on cohorts/programmes.
  if (user.role === Role.INSTRUCTOR) {
    await ensureInstructorProfile(user.id, user.name, {
      title: parsed.data.title,
      bio: parsed.data.bio,
    });
    revalidatePath("/admin/instructors");
    revalidatePath("/admin/cohorts");
  }
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateUserRole(formData: FormData): Promise<void> {
  await requireSection("users");
  const id = formData.get("id");
  const role = formData.get("role");
  if (typeof id !== "string" || typeof role !== "string") return;
  if (!ADMIN_ROLE_VALUES.includes(role as Role)) return;
  const updated = await prisma.user.update({ where: { id }, data: { role: role as Role } });
  // Promoting to instructor provisions a content profile so they can be
  // assigned to cohorts. Demoting leaves any existing profile intact.
  if (updated.role === Role.INSTRUCTOR) {
    await ensureInstructorProfile(updated.id, updated.name);
    revalidatePath("/admin/instructors");
    revalidatePath("/admin/cohorts");
  }
  revalidatePath("/admin/users");
}

export async function deleteUser(formData: FormData): Promise<{ error?: string } | void> {
  await requireSection("users");
  const current = await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  if (id === current.id) return { error: "You cannot delete your own account." };
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}

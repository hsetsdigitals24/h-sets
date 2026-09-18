"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { isAvatarUrl } from "@/lib/avatar";
import type { ContentActionState } from "@/lib/content-forms";

/**
 * The signed-in staff member, for actions that edit their *own* profile.
 * Students have no admin profile (their account lives under /account), so they
 * are refused even though middleware already keeps them out of /admin.
 */
async function requireStaff() {
  const user = await requireUser();
  if (user.role === "STUDENT") throw new Error("Staff only.");
  return user;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  jobTitle: z.string().max(120, "Job title is too long").optional(),
  phone: z.string().max(40, "Phone number is too long").optional(),
  bio: z.string().max(1000, "Bio must be 1000 characters or fewer").optional(),
  // Empty string = "no picture"; the field is cleared by the Remove button.
  // Either one of our own avatar URLs (a picture stored in the database) or an
  // absolute https URL (a picture uploaded to R2 before avatars moved here).
  image: z
    .string()
    .refine(
      (v) => v === "" || isAvatarUrl(v) || /^https:\/\//.test(v),
      "Profile picture upload failed — try again"
    ),
});

/** Trim a form value to a string, collapsing blanks to undefined. */
function text(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/**
 * A staff member updates their own profile. Only the fields they own are
 * writable here — role and access permissions stay under /admin/users, so this
 * page can be open to every staff member without being a privilege-escalation
 * path.
 */
export async function updateProfile(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireStaff();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    jobTitle: text(formData.get("jobTitle")),
    phone: text(formData.get("phone")),
    bio: text(formData.get("bio")),
    image: typeof formData.get("image") === "string" ? formData.get("image") : "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, jobTitle, phone, bio, image } = parsed.data;

  // "Remove" clears the field — drop the stored bytes too rather than leaving
  // an orphaned blob behind.
  if (!image) {
    await prisma.userAvatar.deleteMany({ where: { userId: user.id } });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      jobTitle: jobTitle ?? null,
      phone: phone ?? null,
      bio: bio ?? null,
      image: image || null,
    },
  });

  // An instructor's public profile card mirrors these same details, so keep the
  // two in step rather than making them edit the same thing twice. updateMany
  // is a no-op when this account has no linked Instructor row.
  if (updated.role === "INSTRUCTOR") {
    await prisma.instructor.updateMany({
      where: { userId: updated.id },
      data: {
        name,
        ...(jobTitle ? { title: jobTitle } : {}),
        ...(bio ? { bio } : {}),
      },
    });
    revalidatePath("/admin/instructors");
  }

  revalidatePath("/admin/profile");
  revalidatePath("/admin/users");
  // The header avatar is rendered by the dashboard layout on every admin page.
  revalidatePath("/admin", "layout");
  return { ok: true };
}

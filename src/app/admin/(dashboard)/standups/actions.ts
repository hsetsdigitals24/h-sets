"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import type { ContentActionState } from "@/lib/content-forms";

const schema = z.object({
  name: z.string().trim().min(2, "Give the room a name (2+ characters).").max(100),
  description: z.string().trim().max(300, "Keep the description under 300 characters.").optional(),
});

/** Turn a room name into a URL/room-safe slug (`company-<slug>` in LiveKit). */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Create a company standup room. Any staff member with standups access can add
 * one (the join gate stays "internal, non-student" regardless). The slug is
 * derived from the name and de-duplicated so two rooms never collide.
 */
export async function createCompanyRoom(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("standups");

  const parsed = schema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const base = slugify(parsed.data.name);
  if (!base) return { error: "Use a name with letters or numbers." };

  // De-duplicate: all-hands, all-hands-2, all-hands-3, …
  let slug = base;
  for (let i = 2; await prisma.companyRoom.count({ where: { slug } }); i++) {
    slug = `${base}-${i}`;
  }

  await prisma.companyRoom.create({
    data: {
      slug,
      name: parsed.data.name,
      description: parsed.data.description || null,
      createdById: user.id,
    },
  });

  revalidatePath("/admin/standups");
  return { ok: true };
}

/**
 * Delete a company standup room. Restricted to SUPER_ADMIN (destructive — it
 * cascades to the room's recording rows). Any in-flight recording should be
 * stopped first from the call UI; the DB cascade only removes rows, not the R2
 * objects (a later cleanup pass can sweep orphaned files).
 */
export async function deleteCompanyRoom(
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("standups");
  if (user.role !== "SUPER_ADMIN") {
    return { error: "Only a super admin can delete a standup room." };
  }

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing room id." };

  await prisma.companyRoom.deleteMany({ where: { id } });
  revalidatePath("/admin/standups");
  return { ok: true };
}

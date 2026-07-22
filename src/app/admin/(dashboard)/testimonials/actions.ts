"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import type { ContentActionState } from "@/lib/content-forms";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
  quote: z.string().min(10, "Quote is required"),
  rating: z.coerce.number().int().min(1).max(5),
  initials: z.string().min(1).max(4),
  sortOrder: z.coerce.number().int().min(0).default(0),
  published: z.enum(["true", "false"]).transform((v) => v === "true"),
});

function read(formData: FormData) {
  return schema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    company: formData.get("company"),
    quote: formData.get("quote"),
    rating: formData.get("rating"),
    initials: formData.get("initials"),
    sortOrder: formData.get("sortOrder") ?? 0,
    published: formData.get("published") ?? "true",
  });
}

function revalidateAll() {
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function createTestimonial(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("testimonials");
  const parsed = read(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await prisma.testimonial.create({ data: parsed.data });
  revalidateAll();
  redirect("/admin/testimonials");
}

export async function updateTestimonial(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("testimonials");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const parsed = read(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  await prisma.testimonial.update({ where: { id }, data: parsed.data });
  revalidateAll();
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(formData: FormData) {
  await requireSection("testimonials");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.testimonial.delete({ where: { id } });
  revalidateAll();
}

export async function toggleTestimonialPublished(formData: FormData) {
  await requireSection("testimonials");
  const id = formData.get("id");
  const published = formData.get("published") === "true";
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.testimonial.update({ where: { id }, data: { published } });
  revalidateAll();
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { slugify, type ContentActionState } from "@/lib/content-forms";
import { buildKey, presignPublicUpload, publicUrl } from "@/lib/storage";
import type { PresignResult } from "@/components/lms/file-upload";

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  icon: z.string().min(1, "Icon is required"),
  description: z.string().min(10, "Description is required"),
  gate: z.enum(["email", "emailRole", "emailCompany", "full"]),
  tag: z.string().min(1, "Tag is required"),
  accent: z.string().min(1, "Accent is required"),
  fileKey: z.string().optional(),
  fileName: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  published: z.enum(["true", "false"]).transform((v) => v === "true"),
});

function read(formData: FormData) {
  return schema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    type: formData.get("type"),
    icon: formData.get("icon"),
    description: formData.get("description"),
    gate: formData.get("gate"),
    tag: formData.get("tag"),
    accent: formData.get("accent"),
    fileKey: formData.get("r2Key") || undefined,
    fileName: formData.get("fileName") || undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    published: formData.get("published") ?? "true",
  });
}

/** Presigned URL for uploading a resource PDF to the public bucket. */
export async function requestResourceUpload(
  filename: string,
  contentType: string
): Promise<PresignResult> {
  await requireSection("resources");
  try {
    const key = buildKey("resources", filename);
    const url = await presignPublicUpload(key, contentType);
    return { url, key };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not start upload." };
  }
}

/** Derive the file columns from an upload; empty object when no new file. */
function fileData(fileKey?: string, fileName?: string) {
  if (!fileKey) return {};
  return { fileKey, fileName: fileName ?? null, fileUrl: publicUrl(fileKey) };
}

function revalidateAll() {
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

export async function createResource(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("resources");
  const parsed = read(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { slug: rawSlug, fileKey, fileName, ...rest } = parsed.data;
  const slug = rawSlug?.trim() ? slugify(rawSlug) : slugify(rest.title);
  try {
    await prisma.resource.create({ data: { ...rest, slug, ...fileData(fileKey, fileName) } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: `A resource with slug "${slug}" already exists.` };
    }
    throw e;
  }
  revalidateAll();
  redirect("/admin/resources");
}

export async function updateResource(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("resources");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const parsed = read(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { slug: rawSlug, fileKey, fileName, ...rest } = parsed.data;
  const slug = rawSlug?.trim() ? slugify(rawSlug) : slugify(rest.title);
  try {
    await prisma.resource.update({
      where: { id },
      data: { ...rest, slug, ...fileData(fileKey, fileName) },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: `A resource with slug "${slug}" already exists.` };
    }
    throw e;
  }
  revalidateAll();
  redirect("/admin/resources");
}

export async function deleteResource(formData: FormData) {
  await requireSection("resources");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.resource.delete({ where: { id } });
  revalidateAll();
}

export async function toggleResourcePublished(formData: FormData) {
  await requireSection("resources");
  const id = formData.get("id");
  const published = formData.get("published") === "true";
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.resource.update({ where: { id }, data: { published } });
  revalidateAll();
}

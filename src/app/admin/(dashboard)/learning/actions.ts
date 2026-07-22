"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { canManageCohort } from "@/lib/cohort-access";
import { buildKey, presignUpload, deleteObject } from "@/lib/storage";
import { linesToArray, type ContentActionState } from "@/lib/content-forms";
import type { PresignResult } from "@/components/lms/file-upload";

const MATERIAL_KINDS = ["pdf", "doc", "video", "slide", "link", "other"] as const;

const NOT_ASSIGNED = "You are not assigned to this cohort.";

function revalidate(cohortId: string) {
  revalidatePath(`/admin/learning`);
  revalidatePath(`/account/learn/${cohortId}`);
}

// --- Modules -------------------------------------------------------------

const moduleSchema = z.object({
  cohortId: z.string().min(1),
  title: z.string().min(2, "Module title is required"),
});

export async function createModule(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("learning");
  const parsed = moduleSchema.safeParse({
    cohortId: formData.get("cohortId"),
    title: formData.get("title"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (!(await canManageCohort(user, parsed.data.cohortId))) return { error: NOT_ASSIGNED };
  const count = await prisma.module.count({ where: { cohortId: parsed.data.cohortId } });
  await prisma.module.create({
    data: { cohortId: parsed.data.cohortId, title: parsed.data.title, order: count },
  });
  revalidate(parsed.data.cohortId);
  return { ok: true };
}

export async function deleteModule(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireSection("learning");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const existing = await prisma.module.findUnique({ where: { id }, select: { cohortId: true } });
  if (!existing) return { error: "Module not found." };
  if (!(await canManageCohort(user, existing.cohortId))) return { error: NOT_ASSIGNED };
  const mod = await prisma.module.delete({ where: { id } });
  revalidate(mod.cohortId);
}

// --- Lessons -------------------------------------------------------------

const lessonSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(2, "Lesson title is required"),
});

export async function createLesson(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("learning");
  const parsed = lessonSchema.safeParse({
    moduleId: formData.get("moduleId"),
    title: formData.get("title"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const body = linesToArray(formData.get("body"));
  const liveUrl = (formData.get("liveUrl") as string)?.trim() || null;

  const mod = await prisma.module.findUnique({ where: { id: parsed.data.moduleId } });
  if (!mod) return { error: "Module not found." };
  if (!(await canManageCohort(user, mod.cohortId))) return { error: NOT_ASSIGNED };
  const count = await prisma.lesson.count({ where: { moduleId: parsed.data.moduleId } });
  await prisma.lesson.create({
    data: {
      moduleId: parsed.data.moduleId,
      title: parsed.data.title,
      body,
      liveUrl,
      order: count,
    },
  });
  revalidate(mod.cohortId);
  return { ok: true };
}

export async function deleteLesson(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireSection("learning");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const owner = await prisma.lesson.findUnique({
    where: { id },
    select: { module: { select: { cohortId: true } } },
  });
  if (!owner) return { error: "Lesson not found." };
  if (!(await canManageCohort(user, owner.module.cohortId))) return { error: NOT_ASSIGNED };
  const lesson = await prisma.lesson.delete({
    where: { id },
    include: { module: { select: { cohortId: true } }, materials: { select: { r2Key: true } } },
  });
  await Promise.all(lesson.materials.map((m) => (m.r2Key ? deleteObject(m.r2Key) : null)));
  revalidate(lesson.module.cohortId);
}

// --- Materials -----------------------------------------------------------

/** Presigned URL for uploading a material file. Guarded to the learning section. */
export async function requestMaterialUpload(
  filename: string,
  contentType: string
): Promise<PresignResult> {
  await requireSection("learning");
  try {
    const key = buildKey("materials", filename);
    const url = await presignUpload(key, contentType);
    return { url, key };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not start upload." };
  }
}

const materialSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1, "Material title is required"),
  kind: z.enum(MATERIAL_KINDS),
});

export async function createMaterial(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("learning");
  const parsed = materialSchema.safeParse({
    lessonId: formData.get("lessonId"),
    title: formData.get("title"),
    kind: formData.get("kind"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const r2Key = (formData.get("r2Key") as string)?.trim() || null;
  const fileName = (formData.get("fileName") as string)?.trim() || null;
  const url = (formData.get("url") as string)?.trim() || null;
  if (!r2Key && !url) return { error: "Upload a file or provide an external link." };

  const lesson = await prisma.lesson.findUnique({
    where: { id: parsed.data.lessonId },
    include: { module: { select: { cohortId: true } } },
  });
  if (!lesson) return { error: "Lesson not found." };
  if (!(await canManageCohort(user, lesson.module.cohortId))) return { error: NOT_ASSIGNED };

  const count = await prisma.material.count({ where: { lessonId: parsed.data.lessonId } });
  await prisma.material.create({
    data: {
      lessonId: parsed.data.lessonId,
      title: fileName && !parsed.data.title ? fileName : parsed.data.title,
      kind: parsed.data.kind,
      r2Key,
      url,
      order: count,
    },
  });
  revalidate(lesson.module.cohortId);
  return { ok: true };
}

export async function deleteMaterial(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireSection("learning");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const owner = await prisma.material.findUnique({
    where: { id },
    select: { lesson: { select: { module: { select: { cohortId: true } } } } },
  });
  if (!owner) return { error: "Material not found." };
  if (!(await canManageCohort(user, owner.lesson.module.cohortId))) return { error: NOT_ASSIGNED };
  const material = await prisma.material.delete({
    where: { id },
    include: { lesson: { include: { module: { select: { cohortId: true } } } } },
  });
  if (material.r2Key) await deleteObject(material.r2Key);
  revalidate(material.lesson.module.cohortId);
}

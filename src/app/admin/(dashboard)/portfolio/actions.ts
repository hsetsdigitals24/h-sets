"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { linesToArray, parseJson, slugify, type ContentActionState } from "@/lib/content-forms";

const resultsSchema = z.array(z.object({ metric: z.string(), label: z.string() }));
const testimonialSchema = z
  .object({ quote: z.string(), name: z.string(), role: z.string() })
  .nullable();

const scalarSchema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z.string().optional(),
  client: z.string().min(1, "Client is required"),
  industry: z.string().min(1, "Industry is required"),
  service: z.string().min(1, "Service is required"),
  summary: z.string().min(10, "Summary is required"),
  challenge: z.string().min(10, "Challenge is required"),
  solution: z.string().min(10, "Solution is required"),
  accent: z.string().min(1, "Accent is required"),
  thumbnail: z
    .string()
    .url("Thumbnail must be a valid URL")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
  sourceUrl: z
    .string()
    .url("Landing page URL must be valid")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
  published: z.enum(["true", "false"]).transform((v) => v === "true"),
});

function buildData(formData: FormData) {
  const parsed = scalarSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    client: formData.get("client"),
    industry: formData.get("industry"),
    service: formData.get("service"),
    summary: formData.get("summary"),
    challenge: formData.get("challenge"),
    solution: formData.get("solution"),
    accent: formData.get("accent"),
    thumbnail: formData.get("thumbnail") ?? "",
    sourceUrl: formData.get("sourceUrl") ?? "",
    published: formData.get("published") ?? "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." } as const;
  }
  const tech = linesToArray(formData.get("tech"));
  const related = linesToArray(formData.get("related"));
  try {
    const results = parseJson(formData.get("results"), resultsSchema, "Results");
    const testimonial = parseJson(formData.get("testimonial"), testimonialSchema, "Testimonial");
    const { slug: rawSlug, ...rest } = parsed.data;
    const slug = rawSlug?.trim() ? slugify(rawSlug) : slugify(rest.title);
    return {
      data: { ...rest, slug, tech, related, results, testimonial: testimonial ?? Prisma.JsonNull },
    } as const;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid JSON field." } as const;
  }
}

function revalidateAll(slug?: string) {
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  if (slug) revalidatePath(`/portfolio/${slug}`);
}

export async function createPortfolioItem(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("portfolio");
  const built = buildData(formData);
  if ("error" in built) return { error: built.error };
  try {
    await prisma.portfolio.create({ data: built.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: `A portfolio item with slug "${built.data.slug}" already exists.` };
    }
    throw e;
  }
  revalidateAll(built.data.slug);
  redirect("/admin/portfolio");
}

export async function updatePortfolioItem(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("portfolio");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const built = buildData(formData);
  if ("error" in built) return { error: built.error };
  try {
    await prisma.portfolio.update({ where: { id }, data: built.data });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: `A portfolio item with slug "${built.data.slug}" already exists.` };
    }
    throw e;
  }
  revalidateAll(built.data.slug);
  redirect("/admin/portfolio");
}

export async function deletePortfolioItem(formData: FormData) {
  await requireSection("portfolio");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.portfolio.delete({ where: { id } });
  revalidateAll();
}

export async function togglePortfolioItemPublished(formData: FormData) {
  await requireSection("portfolio");
  const id = formData.get("id");
  const published = formData.get("published") === "true";
  if (typeof id !== "string") return { error: "Missing id." };
  const row = await prisma.portfolio.update({ where: { id }, data: { published } });
  revalidateAll(row.slug);
}

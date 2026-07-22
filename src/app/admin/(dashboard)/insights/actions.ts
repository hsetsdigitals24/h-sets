"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { slugify, type ContentActionState } from "@/lib/content-forms";

/** Allowlist sanitizer for rich-text article bodies written by admins. */
function sanitizeBody(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") return "";
  return sanitizeHtml(value, {
    allowedTags: [
      "p", "br", "strong", "em", "s", "code", "pre",
      "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "a", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  }).trim();
}

/** True when sanitized HTML has no visible text or media. */
function isEmptyBody(html: string): boolean {
  return sanitizeHtml(html, { allowedTags: ["img"], allowedAttributes: { img: ["src"] } })
    .replace(/<img[^>]*>/g, "x")
    .replace(/&nbsp;/g, " ")
    .trim().length === 0;
}

const insightSchema = z.object({
  title: z.string().min(3, "Title is required"),
  slug: z.string().optional(),
  excerpt: z.string().min(10, "Add a short excerpt"),
  category: z.string().min(1, "Category is required"),
  author: z.string().min(1, "Author is required"),
  authorRole: z.string().min(1, "Author role is required"),
  date: z.string().min(1, "Date is required"),
  readMins: z.coerce.number().int().min(1).max(120),
  accent: z.string().min(1, "Accent is required"),
  published: z.enum(["true", "false"]).transform((v) => v === "true"),
});

function readInsight(formData: FormData) {
  const parsed = insightSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt"),
    category: formData.get("category"),
    author: formData.get("author"),
    authorRole: formData.get("authorRole"),
    date: formData.get("date"),
    readMins: formData.get("readMins"),
    accent: formData.get("accent"),
    published: formData.get("published") ?? "true",
  });
  const body = sanitizeBody(formData.get("body"));
  return { parsed, body };
}

function revalidateInsights(slug?: string) {
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
  if (slug) revalidatePath(`/insights/${slug}`);
}

export async function createInsight(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("insights");
  const { parsed, body } = readInsight(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (isEmptyBody(body)) return { error: "Add some body content." };

  const slug = parsed.data.slug?.trim() ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  try {
    await prisma.insight.create({
      data: {
        slug,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        category: parsed.data.category,
        author: parsed.data.author,
        authorRole: parsed.data.authorRole,
        date: parsed.data.date,
        readMins: parsed.data.readMins,
        accent: parsed.data.accent,
        body,
        published: parsed.data.published,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: `An insight with slug "${slug}" already exists.` };
    }
    throw e;
  }
  revalidateInsights(slug);
  redirect("/admin/insights");
}

export async function updateInsight(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("insights");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const { parsed, body } = readInsight(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (isEmptyBody(body)) return { error: "Add some body content." };

  const slug = parsed.data.slug?.trim() ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  try {
    await prisma.insight.update({
      where: { id },
      data: {
        slug,
        title: parsed.data.title,
        excerpt: parsed.data.excerpt,
        category: parsed.data.category,
        author: parsed.data.author,
        authorRole: parsed.data.authorRole,
        date: parsed.data.date,
        readMins: parsed.data.readMins,
        accent: parsed.data.accent,
        body,
        published: parsed.data.published,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: `An insight with slug "${slug}" already exists.` };
    }
    throw e;
  }
  revalidateInsights(slug);
  redirect("/admin/insights");
}

export async function deleteInsight(formData: FormData) {
  await requireSection("insights");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.insight.delete({ where: { id } });
  revalidateInsights();
}

export async function toggleInsightPublished(formData: FormData) {
  await requireSection("insights");
  const id = formData.get("id");
  const published = formData.get("published") === "true";
  if (typeof id !== "string") return { error: "Missing id." };
  const row = await prisma.insight.update({ where: { id }, data: { published } });
  revalidateInsights(row.slug);
}

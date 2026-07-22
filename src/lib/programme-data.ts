import { z } from "zod";
import { linesToArray, parseJson, slugify } from "@/lib/content-forms";

const curriculumSchema = z.array(
  z.object({
    week: z.string(),
    title: z.string(),
    topics: z.array(z.string()),
  })
);
const faqsSchema = z.array(z.object({ q: z.string(), a: z.string() }));

const scalarSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  icon: z.string().min(1, "Icon is required"),
  level: z.string().min(1, "Level is required"),
  category: z.string().min(1, "Category is required"),
  durationWeeks: z.coerce.number().int().min(1).max(104),
  feeFull: z.coerce.number().int().min(0),
  feeInstallment: z.coerce.number().int().min(0),
  short: z.string().min(10, "Short description is required"),
  overview: z.string().min(10, "Overview is required"),
  instructorId: z.string().min(1, "Instructor is required"),
  sortOrder: z.coerce.number().int().min(0).default(0),
  published: z.enum(["true", "false"]).transform((v) => v === "true"),
});

/**
 * Parse and normalise the programme fields from a submitted form.
 * Shared by the cohort create/update actions, which embed the programme form.
 */
export function buildProgrammeData(formData: FormData) {
  const parsed = scalarSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    icon: formData.get("icon"),
    level: formData.get("level"),
    category: formData.get("category"),
    durationWeeks: formData.get("durationWeeks"),
    feeFull: formData.get("feeFull"),
    feeInstallment: formData.get("feeInstallment"),
    short: formData.get("short"),
    overview: formData.get("overview"),
    instructorId: formData.get("instructorId"),
    sortOrder: formData.get("sortOrder") ?? 0,
    published: formData.get("published") ?? "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." } as const;
  }

  const outcomes = linesToArray(formData.get("outcomes"));
  const tools = linesToArray(formData.get("tools"));
  try {
    const curriculum = parseJson(formData.get("curriculum"), curriculumSchema, "Curriculum");
    const faqs = parseJson(formData.get("faqs"), faqsSchema, "FAQs");
    const { slug: rawSlug, ...rest } = parsed.data;
    const slug = rawSlug?.trim() ? slugify(rawSlug) : slugify(rest.name);
    return {
      data: { ...rest, slug, outcomes, tools, curriculum, faqs },
    } as const;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid JSON field." } as const;
  }
}

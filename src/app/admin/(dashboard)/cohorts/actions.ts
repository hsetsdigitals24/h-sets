"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { buildProgrammeData } from "@/lib/programme-data";
import type { ContentActionState } from "@/lib/content-forms";

const cohortSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  format: z.enum(["Full-time", "Part-time", "Weekend"]),
  seatsTotal: z.coerce.number().int().min(1),
  seatsLeft: z.coerce.number().int().min(0),
  status: z.enum(["Open", "Filling Fast", "Full", "Waitlist"]),
  instructorIds: z.array(z.string().min(1)).min(1, "Assign at least one instructor"),
});

function readCohort(formData: FormData) {
  return cohortSchema.safeParse({
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    format: formData.get("format"),
    seatsTotal: formData.get("seatsTotal"),
    seatsLeft: formData.get("seatsLeft"),
    status: formData.get("status"),
    instructorIds: formData.getAll("instructorIds"),
  });
}

function revalidateAll(slug?: string) {
  revalidatePath("/admin/cohorts");
  revalidatePath("/academy");
  if (slug) revalidatePath(`/academy/${slug}`);
}

export async function createCohort(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("cohorts");
  const parsed = readCohort(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { instructorIds, ...cohortRest } = parsed.data;

  let programmeId: string;
  let slug: string | undefined;

  if (formData.get("programmeMode") === "new") {
    const built = buildProgrammeData(formData);
    if ("error" in built) return { error: built.error };
    slug = built.data.slug;
    try {
      const programme = await prisma.programme.create({ data: built.data });
      programmeId = programme.id;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { error: `A programme with slug "${slug}" already exists.` };
      }
      throw e;
    }
  } else {
    const id = formData.get("programmeId");
    if (typeof id !== "string" || id.length === 0) return { error: "Programme is required" };
    programmeId = id;
  }

  await prisma.cohort.create({
    data: {
      programmeId,
      ...cohortRest,
      instructors: { connect: instructorIds.map((id) => ({ id })) },
    },
  });
  revalidateAll(slug);
  redirect("/admin/cohorts");
}

export async function updateCohort(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("cohorts");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const parsed = readCohort(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { instructorIds, ...cohortRest } = parsed.data;

  // The edit form always edits the cohort's linked programme inline.
  const built = buildProgrammeData(formData);
  if ("error" in built) return { error: built.error };
  const cohort = await prisma.cohort.findUnique({ where: { id }, select: { programmeId: true } });
  if (!cohort) return { error: "Cohort not found." };

  try {
    await prisma.$transaction([
      prisma.programme.update({ where: { id: cohort.programmeId }, data: built.data }),
      prisma.cohort.update({
        where: { id },
        data: {
          ...cohortRest,
          instructors: { set: instructorIds.map((id) => ({ id })) },
        },
      }),
    ]);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: `A programme with slug "${built.data.slug}" already exists.` };
    }
    throw e;
  }
  revalidateAll(built.data.slug);
  redirect("/admin/cohorts");
}

export async function deleteCohort(formData: FormData) {
  await requireSection("cohorts");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.cohort.delete({ where: { id } });
  revalidateAll();
}

export async function toggleCohortPublished(formData: FormData) {
  await requireSection("cohorts");
  const id = formData.get("id");
  const published = formData.get("published") === "true";
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.cohort.update({ where: { id }, data: { published } });
  revalidateAll();
}

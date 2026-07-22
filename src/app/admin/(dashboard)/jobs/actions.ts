"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import type { ContentActionState } from "@/lib/content-forms";

const jobSchema = z.object({
  title: z.string().min(2, "Title is required"),
  company: z.string().min(1, "Company is required"),
  type: z.enum(["Internship", "Graduate", "Full-time"]),
  location: z.string().min(1, "Location is required"),
  mode: z.enum(["Remote", "Hybrid", "On-site"]),
  salary: z.string().min(1, "Salary is required"),
  category: z.string().min(1, "Category is required"),
  posted: z.string().min(1, "Posted date is required"),
  deadline: z.string().min(1, "Deadline is required"),
  summary: z.string().min(10, "Add a short summary"),
  published: z.enum(["true", "false"]).transform((v) => v === "true"),
});

function readJob(formData: FormData) {
  return jobSchema.safeParse({
    title: formData.get("title"),
    company: formData.get("company"),
    type: formData.get("type"),
    location: formData.get("location"),
    mode: formData.get("mode"),
    salary: formData.get("salary"),
    category: formData.get("category"),
    posted: formData.get("posted"),
    deadline: formData.get("deadline"),
    summary: formData.get("summary"),
    published: formData.get("published") ?? "true",
  });
}

function revalidateJobs() {
  revalidatePath("/admin/jobs");
  revalidatePath("/careers");
}

export async function createJob(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("jobs");
  const parsed = readJob(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  await prisma.job.create({ data: parsed.data });
  revalidateJobs();
  redirect("/admin/jobs");
}

export async function updateJob(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("jobs");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const parsed = readJob(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  await prisma.job.update({ where: { id }, data: parsed.data });
  revalidateJobs();
  redirect("/admin/jobs");
}

export async function deleteJob(formData: FormData) {
  await requireSection("jobs");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.job.delete({ where: { id } });
  revalidateJobs();
}

export async function toggleJobPublished(formData: FormData) {
  await requireSection("jobs");
  const id = formData.get("id");
  const published = formData.get("published") === "true";
  if (typeof id !== "string") return { error: "Missing id." };
  await prisma.job.update({ where: { id }, data: { published } });
  revalidateJobs();
}

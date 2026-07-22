"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSection, requireRole, requireUser } from "@/lib/auth";
import { canManageCohort } from "@/lib/cohort-access";
import type { ContentActionState } from "@/lib/content-forms";

const NOT_ASSIGNED = "You are not assigned to this cohort.";

// --- Exams ---------------------------------------------------------------

const examSchema = z.object({
  cohortId: z.string().min(1, "Pick a cohort"),
  title: z.string().min(2, "Title is required"),
  instructions: z.string().optional(),
  durationMins: z.coerce.number().int().min(1).max(600),
  passMark: z.coerce.number().int().min(0).max(100),
  maxAttempts: z.coerce.number().int().min(1).max(10),
  cooldownMins: z.coerce.number().int().min(0).max(10080),
  retakeOnFail: z.coerce.boolean().optional(),
  shuffle: z.coerce.boolean().optional(),
  // Integrity controls
  questionsToServe: z.coerce.number().int().min(0).max(500).optional(),
  shuffleOptions: z.coerce.boolean().optional(),
  requireAttestation: z.coerce.boolean().optional(),
  attestationText: z.string().optional(),
  requireFullscreen: z.coerce.boolean().optional(),
  trackFocus: z.coerce.boolean().optional(),
  restrictCopyPaste: z.coerce.boolean().optional(),
  maxViolations: z.coerce.number().int().min(0).max(50).optional(),
});

/** Read the integrity fields off a FormData into the parse input shape. */
function integrityFields(formData: FormData) {
  return {
    questionsToServe: formData.get("questionsToServe"),
    shuffleOptions: formData.get("shuffleOptions") === "true",
    requireAttestation: formData.get("requireAttestation") === "true",
    attestationText: formData.get("attestationText"),
    requireFullscreen: formData.get("requireFullscreen") === "true",
    trackFocus: formData.get("trackFocus") === "true",
    restrictCopyPaste: formData.get("restrictCopyPaste") === "true",
    maxViolations: formData.get("maxViolations"),
  };
}

type IntegrityInput = Pick<
  z.infer<typeof examSchema>,
  | "questionsToServe"
  | "shuffleOptions"
  | "requireAttestation"
  | "attestationText"
  | "requireFullscreen"
  | "trackFocus"
  | "restrictCopyPaste"
  | "maxViolations"
>;

/** Map parsed integrity values to Prisma data (0/blank `questionsToServe` clears it). */
function integrityData(data: IntegrityInput) {
  return {
    questionsToServe: data.questionsToServe && data.questionsToServe > 0 ? data.questionsToServe : null,
    shuffleOptions: data.shuffleOptions ?? false,
    requireAttestation: data.requireAttestation ?? false,
    attestationText: data.attestationText?.trim() || null,
    requireFullscreen: data.requireFullscreen ?? false,
    trackFocus: data.trackFocus ?? false,
    restrictCopyPaste: data.restrictCopyPaste ?? false,
    maxViolations: data.maxViolations ?? 0,
  };
}

export async function createExam(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  await requireSection("exams");
  const user = await requireUser();
  const parsed = examSchema.safeParse({
    cohortId: formData.get("cohortId"),
    title: formData.get("title"),
    instructions: formData.get("instructions"),
    durationMins: formData.get("durationMins"),
    passMark: formData.get("passMark"),
    maxAttempts: formData.get("maxAttempts"),
    cooldownMins: formData.get("cooldownMins"),
    retakeOnFail: formData.get("retakeOnFail") === "true",
    shuffle: formData.get("shuffle") === "true",
    ...integrityFields(formData),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  if (!(await canManageCohort(user, parsed.data.cohortId))) return { error: NOT_ASSIGNED };

  await prisma.exam.create({
    data: {
      cohortId: parsed.data.cohortId,
      title: parsed.data.title,
      instructions: parsed.data.instructions?.trim() ?? "",
      durationMins: parsed.data.durationMins,
      passMark: parsed.data.passMark,
      maxAttempts: parsed.data.maxAttempts,
      cooldownMins: parsed.data.cooldownMins,
      retakeOnFail: parsed.data.retakeOnFail ?? false,
      shuffle: parsed.data.shuffle ?? false,
      ...integrityData(parsed.data),
      createdById: user.id,
    },
  });
  revalidatePath("/admin/exams");
  return { ok: true };
}

const examUpdateSchema = examSchema.extend({ examId: z.string().min(1) }).omit({ cohortId: true });

export async function updateExam(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("exams");
  const parsed = examUpdateSchema.safeParse({
    examId: formData.get("examId"),
    title: formData.get("title"),
    instructions: formData.get("instructions"),
    durationMins: formData.get("durationMins"),
    passMark: formData.get("passMark"),
    maxAttempts: formData.get("maxAttempts"),
    cooldownMins: formData.get("cooldownMins"),
    retakeOnFail: formData.get("retakeOnFail") === "true",
    shuffle: formData.get("shuffle") === "true",
    ...integrityFields(formData),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const exam = await prisma.exam.findUnique({ where: { id: parsed.data.examId } });
  if (!exam) return { error: "Exam not found." };
  if (!(await canManageCohort(user, exam.cohortId))) return { error: NOT_ASSIGNED };
  if (exam.status === "scheduled") {
    return { error: "This exam is scheduled. Ask an admin to unschedule it before editing." };
  }

  await prisma.exam.update({
    where: { id: parsed.data.examId },
    data: {
      title: parsed.data.title,
      instructions: parsed.data.instructions?.trim() ?? "",
      durationMins: parsed.data.durationMins,
      passMark: parsed.data.passMark,
      maxAttempts: parsed.data.maxAttempts,
      cooldownMins: parsed.data.cooldownMins,
      retakeOnFail: parsed.data.retakeOnFail ?? false,
      shuffle: parsed.data.shuffle ?? false,
      ...integrityData(parsed.data),
    },
  });
  revalidatePath(`/admin/exams/${parsed.data.examId}`);
  return { ok: true };
}

const examIntegritySchema = examSchema
  .pick({
    questionsToServe: true,
    shuffleOptions: true,
    requireAttestation: true,
    attestationText: true,
    requireFullscreen: true,
    trackFocus: true,
    restrictCopyPaste: true,
    maxViolations: true,
  })
  .extend({ examId: z.string().min(1) });

/**
 * Update *only* the integrity controls on an exam. Unlike {@link updateExam},
 * this is allowed in any status (including scheduled/live) because these flags
 * are read live per event/attempt (behavioral) or frozen per attempt at creation
 * (subset/shuffle) — so a change never corrupts an in-progress or graded attempt,
 * it only affects attempts started afterwards. Leaves title/duration/questions/window alone.
 */
export async function updateExamIntegrity(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("exams");
  const parsed = examIntegritySchema.safeParse({
    examId: formData.get("examId"),
    ...integrityFields(formData),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const exam = await prisma.exam.findUnique({
    where: { id: parsed.data.examId },
    select: { cohortId: true },
  });
  if (!exam) return { error: "Exam not found." };
  if (!(await canManageCohort(user, exam.cohortId))) return { error: NOT_ASSIGNED };

  await prisma.exam.update({
    where: { id: parsed.data.examId },
    data: integrityData(parsed.data),
  });
  revalidatePath(`/admin/exams/${parsed.data.examId}`);
  return { ok: true };
}

export async function deleteExam(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireSection("exams");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const owner = await prisma.exam.findUnique({ where: { id }, select: { cohortId: true } });
  if (!owner) return { error: "Exam not found." };
  if (!(await canManageCohort(user, owner.cohortId))) return { error: NOT_ASSIGNED };
  await prisma.exam.delete({ where: { id } });
  revalidatePath("/admin/exams");
}

/**
 * Set the total bonus attempts for one student on one exam (0 clears the grant).
 * Instructors who manage the cohort and admins can issue grants.
 */
export async function setExamRetakeGrant(
  formData: FormData
): Promise<{ error?: string } | void> {
  const user = await requireSection("exams");
  const examId = String(formData.get("examId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const extraAttempts = Number(formData.get("extraAttempts"));
  const reason = (formData.get("reason") as string | null)?.trim() || null;

  if (!examId || !studentId) return { error: "Missing exam or student." };
  if (!Number.isInteger(extraAttempts) || extraAttempts < 0 || extraAttempts > 10) {
    return { error: "Extra attempts must be between 0 and 10." };
  }

  const exam = await prisma.exam.findUnique({ where: { id: examId }, select: { cohortId: true } });
  if (!exam) return { error: "Exam not found." };
  if (!(await canManageCohort(user, exam.cohortId))) return { error: NOT_ASSIGNED };

  await prisma.examRetakeGrant.upsert({
    where: { examId_studentId: { examId, studentId } },
    create: { examId, studentId, extraAttempts, reason, grantedById: user.id },
    update: { extraAttempts, reason, grantedById: user.id },
  });
  revalidatePath(`/admin/exams/${examId}`);
}

const forceRetakeSchema = z.object({
  examId: z.string().min(1),
  studentId: z.string().min(1),
  extraAttempts: z.coerce.number().int().min(0).max(10),
  // datetime-local strings; blank clears the override for that bound.
  openFrom: z.string().nullish(),
  openUntil: z.string().nullish(),
  reason: z.string().nullish(),
});

/**
 * Admin-only: let one student repeat an exam and reopen it for them on a custom
 * window, without touching the cohort-wide schedule. Sets the per-student window
 * override (which also bypasses cooldown / passed gates while active) plus any
 * bonus attempts they need. Blank dates clear that bound of the override.
 */
export async function forceExamRetake(
  formData: FormData
): Promise<{ error?: string } | void> {
  // Admin only — instructors keep setExamRetakeGrant (bonus attempts) but not
  // per-student schedule resets.
  const user = await requireRole("ACADEMY_ADMIN");
  const parsed = forceRetakeSchema.safeParse({
    examId: formData.get("examId"),
    studentId: formData.get("studentId"),
    extraAttempts: formData.get("extraAttempts"),
    openFrom: formData.get("openFrom"),
    openUntil: formData.get("openUntil"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const { examId, studentId, extraAttempts } = parsed.data;

  const parseDate = (value: string | null | undefined): Date | null | undefined => {
    const trimmed = value?.trim();
    if (!trimmed) return null; // blank clears this bound
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? undefined : d; // undefined => invalid
  };
  const startAtOverride = parseDate(parsed.data.openFrom);
  const endAtOverride = parseDate(parsed.data.openUntil);
  if (startAtOverride === undefined || endAtOverride === undefined) {
    return { error: "Invalid date." };
  }
  if (startAtOverride && endAtOverride && endAtOverride <= startAtOverride) {
    return { error: "Open-until must be after open-from." };
  }

  const exam = await prisma.exam.findUnique({ where: { id: examId }, select: { cohortId: true } });
  if (!exam) return { error: "Exam not found." };
  if (!(await canManageCohort(user, exam.cohortId))) return { error: NOT_ASSIGNED };

  const reason = parsed.data.reason?.trim() || null;
  await prisma.examRetakeGrant.upsert({
    where: { examId_studentId: { examId, studentId } },
    create: { examId, studentId, extraAttempts, startAtOverride, endAtOverride, reason, grantedById: user.id },
    update: { extraAttempts, startAtOverride, endAtOverride, reason, grantedById: user.id },
  });
  revalidatePath(`/admin/exams/${examId}`);
}

// --- Questions -----------------------------------------------------------

const questionSchema = z
  .object({
    examId: z.string().min(1),
    type: z.enum(["mcq", "true_false"]),
    text: z.string().min(2, "Question text is required"),
    marks: z.coerce.number().int().min(1).max(100),
    // MCQ: up to 6 options; the correct one is identified by index.
    options: z.array(z.string().trim()).optional(),
    correctIndex: z.coerce.number().int().min(0).optional(),
    // True/False: correct answer.
    correctBool: z.coerce.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "mcq") {
      const opts = (data.options ?? []).filter(Boolean);
      if (opts.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Add at least two options.", path: ["options"] });
      }
      if (data.correctIndex == null || data.correctIndex >= opts.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mark which option is correct.", path: ["correctIndex"] });
      }
    }
  });

async function assertEditable(
  examId: string,
  user: { id: string; role: Role }
): Promise<{ error?: string } | null> {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { status: true, cohortId: true },
  });
  if (!exam) return { error: "Exam not found." };
  if (!(await canManageCohort(user, exam.cohortId))) return { error: NOT_ASSIGNED };
  if (exam.status === "scheduled") return { error: "Unschedule the exam before changing questions." };
  return null;
}

export async function addQuestion(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("exams");
  const parsed = questionSchema.safeParse({
    examId: formData.get("examId"),
    type: formData.get("type"),
    text: formData.get("text"),
    marks: formData.get("marks"),
    options: formData.getAll("options").map(String),
    correctIndex: formData.get("correctIndex"),
    correctBool: formData.get("correctBool") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const guard = await assertEditable(parsed.data.examId, user);
  if (guard) return guard;

  const last = await prisma.examQuestion.findFirst({
    where: { examId: parsed.data.examId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (last?.order ?? -1) + 1;

  let options: { id: string; text: string }[] = [];
  let correct: unknown;
  if (parsed.data.type === "mcq") {
    const opts = (parsed.data.options ?? []).filter(Boolean);
    options = opts.map((text, i) => ({ id: `o${i}`, text }));
    correct = `o${parsed.data.correctIndex}`;
  } else {
    correct = parsed.data.correctBool ?? false;
  }

  await prisma.examQuestion.create({
    data: {
      examId: parsed.data.examId,
      order,
      type: parsed.data.type,
      text: parsed.data.text,
      marks: parsed.data.marks,
      options,
      correct: correct as never,
    },
  });
  revalidatePath(`/admin/exams/${parsed.data.examId}`);
  return { ok: true };
}

const questionUpdateSchema = z
  .object({
    questionId: z.string().min(1),
    type: z.enum(["mcq", "true_false"]),
    text: z.string().min(2, "Question text is required"),
    marks: z.coerce.number().int().min(1).max(100),
    options: z.array(z.string().trim()).optional(),
    correctIndex: z.coerce.number().int().min(0).optional(),
    correctBool: z.coerce.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "mcq") {
      const opts = (data.options ?? []).filter(Boolean);
      if (opts.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Add at least two options.", path: ["options"] });
      }
      if (data.correctIndex == null || data.correctIndex >= opts.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Mark which option is correct.", path: ["correctIndex"] });
      }
    }
  });

export async function updateQuestion(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const user = await requireSection("exams");
  const parsed = questionUpdateSchema.safeParse({
    questionId: formData.get("questionId"),
    type: formData.get("type"),
    text: formData.get("text"),
    marks: formData.get("marks"),
    options: formData.getAll("options").map(String),
    correctIndex: formData.get("correctIndex"),
    correctBool: formData.get("correctBool") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const question = await prisma.examQuestion.findUnique({
    where: { id: parsed.data.questionId },
    select: { examId: true },
  });
  if (!question) return { error: "Question not found." };

  const guard = await assertEditable(question.examId, user);
  if (guard) return guard;

  let options: { id: string; text: string }[] = [];
  let correct: unknown;
  if (parsed.data.type === "mcq") {
    const opts = (parsed.data.options ?? []).filter(Boolean);
    options = opts.map((text, i) => ({ id: `o${i}`, text }));
    correct = `o${parsed.data.correctIndex}`;
  } else {
    correct = parsed.data.correctBool ?? false;
  }

  await prisma.examQuestion.update({
    where: { id: parsed.data.questionId },
    data: {
      type: parsed.data.type,
      text: parsed.data.text,
      marks: parsed.data.marks,
      options,
      correct: correct as never,
    },
  });
  revalidatePath(`/admin/exams/${question.examId}`);
  return { ok: true };
}

export async function deleteQuestion(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireSection("exams");
  const id = formData.get("id");
  if (typeof id !== "string") return { error: "Missing id." };
  const q = await prisma.examQuestion.findUnique({ where: { id }, select: { examId: true } });
  if (!q) return { error: "Question not found." };
  const guard = await assertEditable(q.examId, user);
  if (guard) return guard;
  await prisma.examQuestion.delete({ where: { id } });
  revalidatePath(`/admin/exams/${q.examId}`);
}

// --- Review workflow -----------------------------------------------------

export async function submitExamForReview(formData: FormData): Promise<{ error?: string } | void> {
  const user = await requireSection("exams");
  const examId = formData.get("examId");
  if (typeof examId !== "string") return { error: "Missing exam." };
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { _count: { select: { questions: true } } },
  });
  if (!exam) return { error: "Exam not found." };
  if (!(await canManageCohort(user, exam.cohortId))) return { error: NOT_ASSIGNED };
  if (exam.status !== "draft" && exam.status !== "rejected") {
    return { error: "Only draft or rejected exams can be submitted for review." };
  }
  if (exam._count.questions === 0) return { error: "Add at least one question first." };

  await prisma.exam.update({
    where: { id: examId },
    data: { status: "pending_review", reviewNote: null },
  });
  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath("/admin/exams");
}

const reviewSchema = z.object({
  examId: z.string().min(1),
  decision: z.enum(["approve", "reject"]),
  // These fields are conditionally rendered, so absent ones arrive as null.
  startAt: z.string().nullish(),
  endAt: z.string().nullish(),
  reviewNote: z.string().nullish(),
});

export async function reviewExam(
  _prev: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  // Validation/scheduling is admin-only (SUPER_ADMIN passes implicitly).
  const reviewer = await requireRole("ACADEMY_ADMIN");
  const parsed = reviewSchema.safeParse({
    examId: formData.get("examId"),
    decision: formData.get("decision"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    reviewNote: formData.get("reviewNote"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const exam = await prisma.exam.findUnique({ where: { id: parsed.data.examId } });
  if (!exam) return { error: "Exam not found." };

  if (parsed.data.decision === "reject") {
    const note = parsed.data.reviewNote?.trim();
    if (!note) return { error: "Add a note explaining what to fix." };
    await prisma.exam.update({
      where: { id: parsed.data.examId },
      data: { status: "rejected", reviewNote: note, reviewedById: reviewer.id, reviewedAt: new Date() },
    });
    revalidatePath(`/admin/exams/${parsed.data.examId}`);
    return { ok: true };
  }

  // Approve + schedule
  if (!parsed.data.startAt || !parsed.data.endAt) {
    return { error: "Set both a start and end time." };
  }
  const startAt = new Date(parsed.data.startAt);
  const endAt = new Date(parsed.data.endAt);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return { error: "Invalid dates." };
  }
  if (endAt <= startAt) return { error: "End time must be after the start time." };
  if (endAt <= new Date()) return { error: "The window must end in the future." };

  await prisma.exam.update({
    where: { id: parsed.data.examId },
    data: {
      status: "scheduled",
      startAt,
      endAt,
      reviewNote: null,
      reviewedById: reviewer.id,
      reviewedAt: new Date(),
    },
  });
  revalidatePath(`/admin/exams/${parsed.data.examId}`);
  revalidatePath("/admin/exams");
  return { ok: true };
}

/** Admin returns a scheduled exam to draft (e.g. to fix questions). */
export async function unscheduleExam(formData: FormData): Promise<{ error?: string } | void> {
  await requireRole("ACADEMY_ADMIN");
  const examId = formData.get("examId");
  if (typeof examId !== "string") return { error: "Missing exam." };
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { _count: { select: { attempts: true } } },
  });
  if (!exam) return { error: "Exam not found." };
  if (exam._count.attempts > 0) {
    return { error: "Students have already attempted this exam; it can't be unscheduled." };
  }
  await prisma.exam.update({
    where: { id: examId },
    data: { status: "draft", startAt: null, endAt: null },
  });
  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath("/admin/exams");
}

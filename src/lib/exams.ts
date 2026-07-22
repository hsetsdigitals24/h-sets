/**
 * Shared, dependency-free helpers for the CBT / exams feature. Kept type-only so
 * it can be imported from both server components and client components.
 */

export type ExamStatus = "draft" | "pending_review" | "scheduled" | "rejected" | "archived";

// ---------------------------------------------------------------------------
// Integrity: deterministic sampling / shuffling
//
// All of these are seeded by the attempt id so a given attempt always yields
// the same served questions and option order — the take page can re-derive an
// identical paper on reload, and grading matches what the student saw.
// ---------------------------------------------------------------------------

/** xmur3 string hash → 32-bit seed. */
function seedFrom(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 PRNG — small, fast, deterministic. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic Fisher–Yates shuffle seeded by `seed`. Pure (no input mutation). */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = items.slice();
  const rand = mulberry32(seedFrom(seed));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Pick which questions to serve for an attempt: shuffle when requested, then
 * take the first `count` (a subset when `count` is set and smaller than the
 * bank — "serve N of M"). Returns the ordered question ids to persist on the
 * attempt. `shuffle` off + no `count` preserves the authored order.
 */
export function selectServedQuestionIds(
  questions: readonly { id: string }[],
  opts: { shuffle: boolean; count?: number | null; seed: string }
): string[] {
  const ordered = opts.shuffle
    ? seededShuffle(questions, `${opts.seed}:q`)
    : questions.slice();
  const ids = ordered.map((q) => q.id);
  const n = opts.count ?? 0;
  return n > 0 && n < ids.length ? ids.slice(0, n) : ids;
}

/**
 * Build a per-question shuffled option order for the served questions when
 * `shuffleOptions` is on. Only MCQ questions (with 2+ options) are shuffled;
 * true/false and single-option questions are omitted. Keyed by question id.
 */
export function buildOptionOrders(
  questions: readonly { id: string; type: string; options: { id: string }[] }[],
  servedIds: readonly string[],
  seed: string
): Record<string, string[]> {
  const served = new Set(servedIds);
  const orders: Record<string, string[]> = {};
  for (const q of questions) {
    if (!served.has(q.id) || q.type !== "mcq" || q.options.length < 2) continue;
    orders[q.id] = seededShuffle(q.options.map((o) => o.id), `${seed}:${q.id}`);
  }
  return orders;
}

/**
 * Whether a flagged-event count has reached the auto-submit threshold.
 * `maxViolations <= 0` disables enforcement entirely.
 */
export function violationLimitReached(count: number, maxViolations: number): boolean {
  return maxViolations > 0 && count >= maxViolations;
}

export const EXAM_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  scheduled: "Scheduled",
  rejected: "Rejected",
  archived: "Archived",
};

/** Badge variant for an exam workflow status. */
export function examStatusVariant(status: string): "success" | "accent" | "muted" | "outline" {
  switch (status) {
    case "scheduled":
      return "success";
    case "pending_review":
      return "accent";
    case "rejected":
      return "muted";
    default:
      return "outline";
  }
}

/**
 * When an in-progress attempt must auto-close: the earlier of (start + duration)
 * and the exam window close (`endAt`). Returned as epoch milliseconds. This is
 * the single source of truth for the deadline, shared by the take page, the
 * submit/start actions, and the cron sweep.
 */
export function attemptDeadline(
  startedAt: Date,
  durationMins: number,
  endAt: Date | null
): number {
  const byDuration = startedAt.getTime() + durationMins * 60_000;
  const byWindow = endAt?.getTime() ?? Infinity;
  return Math.min(byDuration, byWindow);
}

/** True once an in-progress attempt is past its {@link attemptDeadline}. */
export function isAttemptExpired(
  startedAt: Date,
  durationMins: number,
  endAt: Date | null,
  now: Date = new Date()
): boolean {
  return now.getTime() >= attemptDeadline(startedAt, durationMins, endAt);
}

export type StudentExamPhase = "upcoming" | "open" | "cooldown" | "closed";

export type ExamAvailability = {
  phase: StudentExamPhase;
  /** Why the exam is closed. Set only when `phase === "closed"`. */
  reason?: "window" | "attempts" | "passed";
  /** When a retake becomes available. Set only when `phase === "cooldown"`. */
  readyAt?: Date;
};

/**
 * Per-student schedule override from an admin retake grant. When either bound is
 * set it replaces the exam's cohort-wide window for that student only and, while
 * active, bypasses the cooldown and already-passed gates.
 */
export type ExamWindowOverride = {
  startAtOverride?: Date | null;
  endAtOverride?: Date | null;
};

/** Attempt-derived inputs for {@link studentExamPhase}. */
export type ExamAttemptContext = {
  attemptsUsed: number;
  /** Bonus attempts from a per-student retake grant (0 if none). */
  extraAttempts: number;
  /** Submission time of the most recently submitted attempt (null if none). */
  lastSubmittedAt: Date | null;
  /** Best submitted score so far (-1 if no submitted attempts). */
  bestScore: number;
  /** Admin per-student window start override (null if none). */
  windowStartOverride: Date | null;
  /** Admin per-student window end override (null if none). */
  windowEndOverride: Date | null;
};

/**
 * The exam window end that actually applies to a student — the admin override
 * end if set, otherwise the cohort-wide `endAt`. Use this (not raw `exam.endAt`)
 * when computing an attempt's deadline for a student who may have an override,
 * so a reopened attempt isn't cut off by a past cohort window.
 */
export function effectiveWindowEnd(
  endAt: Date | null,
  override?: ExamWindowOverride | null
): Date | null {
  return override?.endAtOverride ?? endAt;
}

/**
 * Derive the {@link ExamAttemptContext} from a student's attempts and their
 * (optional) retake grant. Dependency-free so it works in server + client code.
 */
export function examAttemptContext(
  attempts: { status: string; submittedAt: Date | null; score: number | null }[],
  extraAttempts = 0,
  override?: ExamWindowOverride | null
): ExamAttemptContext {
  const submitted = attempts.filter((a) => a.status === "submitted");
  const lastSubmittedAt = submitted.reduce<Date | null>((latest, a) => {
    if (!a.submittedAt) return latest;
    return !latest || a.submittedAt > latest ? a.submittedAt : latest;
  }, null);
  const bestScore = submitted.reduce((max, a) => Math.max(max, a.score ?? 0), -1);
  return {
    attemptsUsed: attempts.length,
    extraAttempts,
    lastSubmittedAt,
    bestScore,
    windowStartOverride: override?.startAtOverride ?? null,
    windowEndOverride: override?.endAtOverride ?? null,
  };
}

/**
 * Where a scheduled exam sits relative to now for a student, given how many
 * attempts they've used, any per-student bonus attempts, cooldown, and the
 * retake-on-fail rule. Only ever called on `scheduled` exams.
 *
 * An active admin window override (either bound set on the grant) replaces the
 * cohort-wide window for this student and bypasses the cooldown and passed gates
 * — the attempts limit still applies (the same grant tops it up).
 */
export function studentExamPhase(
  exam: {
    startAt: Date | null;
    endAt: Date | null;
    maxAttempts: number;
    cooldownMins: number;
    retakeOnFail: boolean;
    passMark: number;
  },
  ctx: ExamAttemptContext,
  now: Date = new Date()
): ExamAvailability {
  const hasOverride = ctx.windowStartOverride != null || ctx.windowEndOverride != null;
  const start = ctx.windowStartOverride ?? exam.startAt;
  const end = ctx.windowEndOverride ?? exam.endAt;

  if (start && now < start) return { phase: "upcoming" };
  if (end && now > end) return { phase: "closed", reason: "window" };
  if (ctx.attemptsUsed >= exam.maxAttempts + ctx.extraAttempts) {
    return { phase: "closed", reason: "attempts" };
  }
  if (!hasOverride && exam.retakeOnFail && ctx.lastSubmittedAt && ctx.bestScore >= exam.passMark) {
    return { phase: "closed", reason: "passed" };
  }
  if (!hasOverride && exam.cooldownMins > 0 && ctx.lastSubmittedAt) {
    const readyAt = new Date(ctx.lastSubmittedAt.getTime() + exam.cooldownMins * 60_000);
    if (now < readyAt) return { phase: "cooldown", readyAt };
  }
  return { phase: "open" };
}

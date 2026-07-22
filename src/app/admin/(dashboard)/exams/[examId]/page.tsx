import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { canManageCohort } from "@/lib/cohort-access";
import { EXAM_STATUS_LABELS, examStatusVariant } from "@/lib/exams";
import { formatDate } from "@/lib/utils";
import { PageHeading } from "@/components/admin/page-heading";
import { ActionButton } from "@/components/lms/action-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { EditExamForm, EditExamIntegrityForm, AddQuestionForm, ReviewExamForm, QuestionItem, RetakeGrantForm, ForceRetakeForm } from "../forms";
import { unscheduleExam } from "../actions";
import { SubmitForReviewButton } from "./submit-for-review-button";

export const dynamic = "force-dynamic";

type McqOption = { id: string; text: string };

const INTEGRITY_LABELS: Record<string, string> = {
  visibility_hidden: "Tab hidden",
  blur: "Left window",
  fullscreen_exit: "Exited fullscreen",
  copy: "Copy",
  paste: "Paste",
  contextmenu: "Right-click",
};

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const user = await requireSection("exams");
  const { examId } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      cohort: { include: { programme: { select: { name: true } } } },
      questions: { orderBy: { order: "asc" } },
      attempts: {
        orderBy: [{ studentId: "asc" }, { attemptNo: "asc" }],
        include: {
          student: { select: { name: true, email: true } },
          events: { orderBy: { createdAt: "asc" }, select: { type: true, createdAt: true } },
        },
      },
      retakeGrants: true,
    },
  });
  if (!exam) notFound();
  if (!(await canManageCohort(user, exam.cohortId))) notFound();

  // One row per student who has attempted, with their used count and any grant.
  const grantByStudent = new Map(exam.retakeGrants.map((g) => [g.studentId, g]));
  const studentSummaries = Array.from(
    exam.attempts
      .reduce((map, a) => {
        const row = map.get(a.studentId) ?? { studentId: a.studentId, student: a.student, used: 0 };
        row.used += 1;
        return map.set(a.studentId, row);
      }, new Map<string, { studentId: string; student: { name: string | null; email: string | null }; used: number }>())
      .values()
  );

  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ACADEMY_ADMIN";
  const editable = exam.status !== "scheduled";
  const canSubmit = exam.status === "draft" || exam.status === "rejected";

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: `/admin/exams?cohort=${exam.cohortId}`, label: "Back to exams" }}
        title={exam.title}
        description={`${exam.cohort.programme.name} · ${exam.durationMins} min · pass ${exam.passMark}% · ${exam.maxAttempts} attempt(s)`}
        action={
          <Badge variant={examStatusVariant(exam.status)}>
            {EXAM_STATUS_LABELS[exam.status] ?? exam.status}
          </Badge>
        }
      />

      {exam.status === "rejected" && exam.reviewNote && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <div className="font-semibold text-amber-700">Sent back for changes</div>
          <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{exam.reviewNote}</p>
        </div>
      )}

      {exam.status === "scheduled" && (
        <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
          <div className="font-semibold text-emerald-700">Scheduled</div>
          <p className="mt-1 text-muted-foreground">
            Open {exam.startAt ? formatDate(exam.startAt.toISOString()) : "—"} →{" "}
            {exam.endAt ? formatDate(exam.endAt.toISOString()) : "—"}
          </p>
          {isAdmin && exam.attempts.length === 0 && (
            <div className="mt-3">
              <ActionButton
                action={unscheduleExam}
                fields={{ examId: exam.id }}
                variant="outline"
                successMessage="Returned to draft"
                confirm="Unschedule this exam and return it to draft?"
              >
                Unschedule
              </ActionButton>
            </div>
          )}
        </div>
      )}

      {/* Exam settings */}
      {editable && (
        <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-sm font-semibold">Exam settings</h2>
          <EditExamForm
            examId={exam.id}
            defaults={{
              title: exam.title,
              instructions: exam.instructions,
              durationMins: exam.durationMins,
              passMark: exam.passMark,
              maxAttempts: exam.maxAttempts,
              cooldownMins: exam.cooldownMins,
              retakeOnFail: exam.retakeOnFail,
              shuffle: exam.shuffle,
              questionsToServe: exam.questionsToServe,
              shuffleOptions: exam.shuffleOptions,
              requireAttestation: exam.requireAttestation,
              attestationText: exam.attestationText ?? "",
              requireFullscreen: exam.requireFullscreen,
              trackFocus: exam.trackFocus,
              restrictCopyPaste: exam.restrictCopyPaste,
              maxViolations: exam.maxViolations,
            }}
          />
        </section>
      )}

      {/* Integrity settings stay editable once scheduled (the full form above is
          hidden then) — these flags never corrupt an in-progress or graded attempt. */}
      {!editable && (
        <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-1 text-sm font-semibold">Integrity settings</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Anti-cheating controls. Editable even while this exam is scheduled.
          </p>
          <EditExamIntegrityForm
            examId={exam.id}
            defaults={{
              questionsToServe: exam.questionsToServe,
              shuffleOptions: exam.shuffleOptions,
              requireAttestation: exam.requireAttestation,
              attestationText: exam.attestationText ?? "",
              requireFullscreen: exam.requireFullscreen,
              trackFocus: exam.trackFocus,
              restrictCopyPaste: exam.restrictCopyPaste,
              maxViolations: exam.maxViolations,
            }}
          />
        </section>
      )}

      {/* Questions */}
      <section className="mb-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-sm font-semibold">
          Questions <span className="text-muted-foreground">({exam.questions.length})</span>
        </h2>

        {exam.questions.length === 0 ? (
          <p className="mb-4 text-sm text-muted-foreground">No questions yet.</p>
        ) : (
          <ol className="mb-6 space-y-3">
            {exam.questions.map((q, i) => (
              <QuestionItem
                key={q.id}
                index={i}
                editable={editable}
                question={{
                  id: q.id,
                  type: q.type,
                  text: q.text,
                  marks: q.marks,
                  options: (q.options as McqOption[]) ?? [],
                  correct: q.correct,
                }}
              />
            ))}
          </ol>
        )}

        {editable && (
          <div className="border-t border-border pt-5">
            <h3 className="mb-3 text-sm font-semibold">Add a question</h3>
            <AddQuestionForm examId={exam.id} />
          </div>
        )}

        {canSubmit && (
          <div className="mt-5 border-t border-border pt-5">
            <SubmitForReviewButton examId={exam.id} />
          </div>
        )}
      </section>

      {/* Admin review / schedule */}
      {isAdmin && exam.status === "pending_review" && (
        <section className="mb-8 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <h2 className="mb-4 text-sm font-semibold">Validate & schedule</h2>
          <ReviewExamForm examId={exam.id} />
        </section>
      )}

      {/* Attempts */}
      <section className="rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border p-5">
          <h2 className="text-sm font-semibold">Student attempts</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Attempt</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Integrity</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exam.attempts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No attempts yet.
                </TableCell>
              </TableRow>
            ) : (
              exam.attempts.map((a) => {
                const eventSummary = a.events
                  .reduce<{ type: string; count: number }[]>((acc, e) => {
                    const row = acc.find((r) => r.type === e.type);
                    if (row) row.count += 1;
                    else acc.push({ type: e.type, count: 1 });
                    return acc;
                  }, [])
                  .map((r) => `${INTEGRITY_LABELS[r.type] ?? r.type} ×${r.count}`)
                  .join(", ");
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {a.student.name}
                      <div className="text-xs text-muted-foreground">{a.student.email}</div>
                    </TableCell>
                    <TableCell>#{a.attemptNo}</TableCell>
                    <TableCell>{a.score == null ? "—" : `${a.score}%`}</TableCell>
                    <TableCell>
                      {a.status !== "submitted" ? (
                        <Badge variant="outline">In progress</Badge>
                      ) : a.passed ? (
                        <Badge variant="success">Passed</Badge>
                      ) : (
                        <Badge variant="muted" className="text-destructive">Failed</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {a.violationCount === 0 ? (
                        <span className="text-xs text-muted-foreground">Clean</span>
                      ) : (
                        <div className="space-y-0.5">
                          <Badge
                            variant="muted"
                            className={a.autoClosedReason === "integrity" ? "text-destructive" : undefined}
                            title={eventSummary}
                          >
                            {a.violationCount} flag(s)
                            {a.autoClosedReason === "integrity" ? " · auto-submitted" : ""}
                          </Badge>
                          {eventSummary && (
                            <div className="text-[11px] text-muted-foreground">{eventSummary}</div>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.submittedAt ? formatDate(a.submittedAt.toISOString()) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </section>

      {/* Per-student retake grants */}
      {studentSummaries.length > 0 && (
        <section className="mt-8 rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border p-5">
            <h2 className="text-sm font-semibold">Retake grants</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {isAdmin
                ? `Give a student bonus attempts on top of the ${exam.maxAttempts}-attempt limit, and optionally reopen the exam for that student alone on a custom window (bypasses cooldown and the passed lock). Set attempts to 0 and clear the dates to remove.`
                : `Give a student bonus attempts on top of the ${exam.maxAttempts}-attempt limit. Set to 0 to remove.`}
            </p>
          </div>
          <ul className="divide-y divide-border">
            {studentSummaries.map((s) => {
              const grant = grantByStudent.get(s.studentId);
              const extra = grant?.extraAttempts ?? 0;
              return (
                <li key={s.studentId} className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="text-sm">
                    <div className="font-medium">{s.student.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.used} / {exam.maxAttempts + extra} attempts used
                      {(grant?.startAtOverride || grant?.endAtOverride) && (
                        <span className="ml-1">
                          · reopened{" "}
                          {grant.startAtOverride ? formatDate(grant.startAtOverride.toISOString()) : "—"} →{" "}
                          {grant.endAtOverride ? formatDate(grant.endAtOverride.toISOString()) : "—"}
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin ? (
                    <ForceRetakeForm
                      examId={exam.id}
                      studentId={s.studentId}
                      defaultExtra={extra}
                      defaultOpenFrom={grant?.startAtOverride?.toISOString() ?? null}
                      defaultOpenUntil={grant?.endAtOverride?.toISOString() ?? null}
                    />
                  ) : (
                    <RetakeGrantForm examId={exam.id} studentId={s.studentId} defaultExtra={extra} />
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ExamTimer } from "@/components/exams/exam-timer";
import { useIntegrityGuard, type IntegrityConfig } from "@/components/exams/use-integrity-guard";
import { cn } from "@/lib/utils";
import { saveExamAnswer, submitExamAttempt, type AnswerInput } from "../../actions";

export type ClientQuestion = {
  id: string;
  type: "mcq" | "true_false";
  text: string;
  marks: number;
  options: { id: string; text: string }[];
};

export function TakeExam({
  examId,
  attemptId,
  title,
  deadline,
  questions,
  integrity,
}: {
  examId: string;
  attemptId: string;
  title: string;
  deadline: number;
  questions: ClientQuestion[];
  integrity: IntegrityConfig;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submitted = useRef(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Best-effort autosave so a server-side auto-submit grades real progress even
  // if the browser goes away. The final submit re-sends everything regardless.
  const setAnswer = useCallback(
    (questionId: string, response: string | boolean) => {
      setAnswers((prev) => ({ ...prev, [questionId]: response }));
      clearTimeout(saveTimers.current[questionId]);
      saveTimers.current[questionId] = setTimeout(() => {
        void saveExamAnswer(attemptId, questionId, response).catch(() => {});
      }, 500);
    },
    [attemptId]
  );

  useEffect(() => {
    const timers = saveTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  // Set inside an effect (not during render) so submit can leave fullscreen.
  const exitFullscreenRef = useRef<(() => void) | null>(null);

  const submit = useCallback(
    async (auto: boolean) => {
      if (submitted.current) return;
      submitted.current = true;
      setSubmitting(true);
      exitFullscreenRef.current?.();
      const payload: AnswerInput[] = Object.entries(answers).map(([questionId, response]) => ({
        questionId,
        response,
      }));
      const res = await submitExamAttempt(attemptId, payload);
      if (res.error) {
        toast.error(res.error);
        submitted.current = false;
        setSubmitting(false);
        return;
      }
      toast[res.passed ? "success" : "info"](
        `${auto ? "Time up — submitted. " : ""}You scored ${res.score}%${res.passed ? " · Passed" : ""}`
      );
      router.push(`/account/exams/${examId}`);
    },
    [answers, attemptId, examId, router]
  );

  // Integrity auto-close is finalized server-side in logExamEvent (graded +
  // marked submitted), so here we just leave fullscreen and go to results —
  // re-POSTing would fail as "already submitted".
  const finishAfterAutoClose = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    exitFullscreenRef.current?.();
    router.push(`/account/exams/${examId}`);
  }, [examId, router]);

  const isActive = useCallback(() => !submitted.current, []);
  const { exitFullscreen } = useIntegrityGuard({
    attemptId,
    config: integrity,
    onAutoSubmit: finishAfterAutoClose,
    isActive,
  });
  useEffect(() => {
    exitFullscreenRef.current = exitFullscreen;
  }, [exitFullscreen]);

  const answeredCount = Object.keys(answers).length;
  const q = questions[current];
  const isLast = current === questions.length - 1;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="sticky top-0 z-10 -mx-6 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
        <div>
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
          <p className="text-xs text-muted-foreground">
            Question {current + 1} of {questions.length} · {answeredCount}/{questions.length} answered
          </p>
        </div>
        <ExamTimer deadline={deadline} onExpire={() => submit(true)} />
      </div>

      {/* Question navigator — jump to any question; shows answered state. */}
      <nav aria-label="Questions" className="mt-5 flex flex-wrap gap-1.5">
        {questions.map((question, i) => {
          const answered = answers[question.id] !== undefined;
          const isCurrent = i === current;
          return (
            <button
              key={question.id}
              type="button"
              aria-current={isCurrent ? "true" : undefined}
              aria-label={`Question ${i + 1}${answered ? ", answered" : ""}`}
              onClick={() => setCurrent(i)}
              className={cn(
                "h-8 w-8 rounded-lg border text-xs font-medium transition-colors",
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : answered
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary"
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </nav>

      {q && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="flex justify-between gap-3">
            <p className="font-medium">
              {current + 1}. {q.text}
            </p>
            <span className="shrink-0 text-xs text-muted-foreground">{q.marks} mark(s)</span>
          </div>
          <div className="mt-3 space-y-2">
            {q.type === "mcq"
              ? q.options.map((o) => (
                  <OptionRow
                    key={o.id}
                    name={q.id}
                    label={o.text}
                    checked={answers[q.id] === o.id}
                    onSelect={() => setAnswer(q.id, o.id)}
                  />
                ))
              : (
                  [
                    { label: "True", value: true },
                    { label: "False", value: false },
                  ] as const
                ).map((opt) => (
                  <OptionRow
                    key={opt.label}
                    name={q.id}
                    label={opt.label}
                    checked={answers[q.id] === opt.value}
                    onSelect={() => setAnswer(q.id, opt.value)}
                  />
                ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3 pb-10">
        <Button
          type="button"
          variant="outline"
          disabled={current === 0}
          onClick={() => setCurrent((i) => Math.max(0, i - 1))}
        >
          Previous
        </Button>

        {isLast ? (
          <Button
            type="button"
            variant="gradient"
            disabled={submitting}
            onClick={() => setConfirmOpen(true)}
          >
            {submitting ? "Submitting…" : "Submit exam"}
          </Button>
        ) : (
          <Button type="button" onClick={() => setCurrent((i) => Math.min(questions.length - 1, i + 1))}>
            Next
          </Button>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit exam?</DialogTitle>
            <DialogDescription>
              You can&apos;t change answers after submitting.
              {answeredCount < questions.length
                ? ` You have ${questions.length - answeredCount} unanswered question(s).`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="gradient"
              disabled={submitting}
              onClick={() => {
                setConfirmOpen(false);
                submit(false);
              }}
            >
              {submitting ? "Submitting…" : "Submit exam"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OptionRow({
  name,
  label,
  checked,
  onSelect,
}: {
  name: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors",
        checked ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="accent-primary" />
      {label}
    </label>
  );
}

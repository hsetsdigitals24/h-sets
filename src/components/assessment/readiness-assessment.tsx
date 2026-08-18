"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { submitForm } from "@/lib/api";
import {
  questions,
  scoreAssessment,
  type ReadinessLevel,
} from "@/lib/assessment";
import { Field } from "@/components/forms/field";
import { useBotGuard } from "@/components/forms/use-bot-guard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Phase = "quiz" | "details" | "result";
type Details = { name: string; email: string; company?: string; phone?: string };

export function ReadinessAssessment() {
  const [phase, setPhase] = React.useState<Phase>("quiz");
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [result, setResult] = React.useState<{
    percent: number;
    level: ReadinessLevel;
  } | null>(null);

  const total = questions.length;
  const current = questions[step];
  // Quiz progresses across questions; details is the final ~step.
  const progress =
    phase === "result"
      ? 100
      : Math.round(((phase === "details" ? total : step) / (total + 1)) * 100);

  function choose(value: number) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setPhase("details");
    }
  }

  function back() {
    if (phase === "details") {
      setPhase("quiz");
      setStep(total - 1);
    } else if (step > 0) {
      setStep(step - 1);
    }
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setResult(null);
    setPhase("quiz");
  }

  const bot = useBotGuard();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Details>();

  async function onSubmitDetails(values: Details) {
    const { percent, level } = scoreAssessment(answers);
    try {
      await submitForm("assessment", {
        ...values,
        percent,
        level: level.title,
        answers,
        ...bot.values(),
      });
      setResult({ percent, level });
      setPhase("result");
    } catch (err) {
      toast.error("Couldn't save your result", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress bar */}
      {phase !== "result" && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>
              {phase === "details" ? "Almost done" : `Question ${step + 1} of ${total}`}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-brand-gradient transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        {phase === "quiz" && (
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              {current.category}
            </span>
            <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
              {current.question}
            </h2>
            <div className="mt-6 space-y-3">
              {current.options.map((opt) => {
                const selected = answers[current.id] === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => choose(opt.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl border border-border px-5 py-4 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary",
                      selected && "border-primary bg-secondary"
                    )}
                  >
                    {opt.label}
                    <ArrowRight
                      className={cn(
                        "size-4 shrink-0 text-primary opacity-0 transition-opacity",
                        selected && "opacity-100"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> Back
              </button>
            )}
          </div>
        )}

        {phase === "details" && (
          <form onSubmit={handleSubmit(onSubmitDetails)} className="space-y-4">
            {bot.fields}
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">
                Where should we send your result?
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You answered all {total} questions. Get your tailored AI readiness
                breakdown instantly.
              </p>
            </div>
            <Field
              label="Full name"
              htmlFor="a-name"
              required
              error={errors.name?.message}
            >
              <Input
                id="a-name"
                placeholder="Ada Lovelace"
                {...register("name", { required: "Name is required" })}
              />
            </Field>
            <Field
              label="Work email"
              htmlFor="a-email"
              required
              error={errors.email?.message}
            >
              <Input
                id="a-email"
                type="email"
                placeholder="you@company.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: "Enter a valid email",
                  },
                })}
              />
            </Field>
            <Field label="Company" htmlFor="a-company">
              <Input id="a-company" placeholder="Company name" {...register("company")} />
            </Field>
            <Field label="Phone" htmlFor="a-phone">
              <Input
                id="a-phone"
                type="tel"
                placeholder="+234…"
                {...register("phone")}
              />
            </Field>
            <div className="flex items-center gap-3 pt-2">
              <Button type="button" variant="outline" onClick={back} disabled={isSubmitting}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button type="submit" variant="gradient" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
                See my result
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </form>
        )}

        {phase === "result" && result && (
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="size-8 text-emerald-500" />
            </div>
            <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-primary">
              Your result
            </span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{result.level.title}</h2>
            <div className="mx-auto mt-5 max-w-xs">
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-bold text-gradient">{result.percent}</span>
                <span className="mb-1.5 text-lg font-semibold text-muted-foreground">%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all duration-700"
                  style={{ width: `${result.percent}%` }}
                />
              </div>
            </div>
            <p className="mx-auto mt-5 max-w-lg font-medium">{result.level.headline}</p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              {result.level.summary}
            </p>

            <div className="mt-8 rounded-xl border border-border bg-secondary/50 p-5 text-left">
              <p className="text-sm font-semibold">Recommended next steps</p>
              <ul className="mt-3 space-y-2.5">
                {result.level.recommendations.map((rec) => (
                  <li key={rec} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="gradient" size="lg">
                <Link href="/contact#consultation">
                  Book a free AI consultation
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={restart}>
                <RotateCcw className="size-4" /> Retake
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              We&apos;ve emailed a copy of your result to keep.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

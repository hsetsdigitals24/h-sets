"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitForm } from "@/lib/api";
import { applicationSchema, type ApplicationInput } from "@/lib/schemas";
import { Field } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type CohortOption = { id: string; label: string };

export function ApplyForm({
  cohorts,
  defaultCohortId,
}: {
  cohorts: CohortOption[];
  defaultCohortId?: string;
}) {
  const [done, setDone] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      cohortId: defaultCohortId ?? cohorts[0]?.id ?? "",
    },
  });

  async function onSubmit(values: ApplicationInput) {
    try {
      await submitForm("application", values);
      toast.success("Application submitted!", {
        description: "We'll review it and email you with the outcome.",
      });
      setDone(true);
    } catch (err) {
      toast.error("Couldn't submit your application", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary/50 p-10 text-center">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <h3 className="text-xl font-semibold">Application received</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thanks for applying. Our admissions team will review your application and email
          you with the next steps. If you&apos;re accepted, you&apos;ll get a link to set up
          your student account.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Cohort" htmlFor="cohortId" required error={errors.cohortId?.message}>
        <Select id="cohortId" {...register("cohortId")}>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" placeholder="Ada Lovelace" {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" placeholder="you@email.com" {...register("email")} />
        </Field>
      </div>
      <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
        <Input id="phone" placeholder="Optional" {...register("phone")} />
      </Field>
      <Field
        label="Your background"
        htmlFor="background"
        required
        error={errors.background?.message}
      >
        <Textarea
          id="background"
          rows={3}
          placeholder="Your current role, experience, and any relevant skills…"
          {...register("background")}
        />
      </Field>
      <Field
        label="Why do you want to join?"
        htmlFor="motivation"
        required
        error={errors.motivation?.message}
      >
        <Textarea
          id="motivation"
          rows={4}
          placeholder="What are your goals, and what do you hope to get out of this cohort?"
          {...register("motivation")}
        />
      </Field>
      <Button
        type="submit"
        variant="gradient"
        size="lg"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Submit application
      </Button>
    </form>
  );
}

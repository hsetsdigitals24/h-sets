"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import type { ContentActionState } from "@/lib/content-forms";
import { createAssignment, gradeSubmission } from "./actions";

export function AddAssignmentForm({ cohortId }: { cohortId: string }) {
  const [state, action] = useActionState<ContentActionState, FormData>(createAssignment, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Assignment created");
      ref.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={ref} action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="cohortId" value={cohortId} />
      <div className="sm:col-span-2">
        <Field label="Title" htmlFor="title">
          <Input id="title" name="title" required />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" rows={3} required />
        </Field>
      </div>
      <Field label="Due date" htmlFor="dueDate">
        <Input id="dueDate" name="dueDate" type="datetime-local" required />
      </Field>
      <Field label="Max score" htmlFor="maxScore">
        <Input id="maxScore" name="maxScore" type="number" defaultValue={100} min={1} required />
      </Field>
      <div className="sm:col-span-2 space-y-3">
        <FormError error={state.error} />
        <SubmitButton>Create assignment</SubmitButton>
      </div>
    </form>
  );
}

export function GradeForm({
  submissionId,
  maxScore,
  defaultScore,
  defaultFeedback,
}: {
  submissionId: string;
  maxScore: number;
  defaultScore?: number | null;
  defaultFeedback?: string | null;
}) {
  const [state, action] = useActionState<ContentActionState, FormData>(gradeSubmission, {});

  useEffect(() => {
    if (state.ok) toast.success("Grade released");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="submissionId" value={submissionId} />
      <Field label={`Score (out of ${maxScore})`} htmlFor={`score-${submissionId}`}>
        <Input
          id={`score-${submissionId}`}
          name="score"
          type="number"
          min={0}
          max={maxScore}
          defaultValue={defaultScore ?? undefined}
          required
        />
      </Field>
      <Field label="Feedback" htmlFor={`fb-${submissionId}`} hint="Required when scoring below 60.">
        <Textarea id={`fb-${submissionId}`} name="feedback" rows={3} defaultValue={defaultFeedback ?? ""} />
      </Field>
      <FormError error={state.error} />
      <SubmitButton>Release grade</SubmitButton>
    </form>
  );
}

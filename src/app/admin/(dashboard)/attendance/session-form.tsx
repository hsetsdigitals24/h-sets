"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import type { ContentActionState } from "@/lib/content-forms";
import { createSession } from "./actions";

export function SessionForm({ cohortId }: { cohortId: string }) {
  const [state, action] = useActionState<ContentActionState, FormData>(createSession, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Session created");
      ref.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="cohortId" value={cohortId} />
      <div className="min-w-[220px] flex-1">
        <Field label="Session title" htmlFor="title">
          <Input id="title" name="title" placeholder="e.g. Week 1 — Live class" required />
        </Field>
      </div>
      <Field label="Date & time" htmlFor="scheduledAt">
        <Input id="scheduledAt" name="scheduledAt" type="datetime-local" required />
      </Field>
      <SubmitButton>Add session</SubmitButton>
      <div className="w-full">
        <FormError error={state.error} />
      </div>
    </form>
  );
}

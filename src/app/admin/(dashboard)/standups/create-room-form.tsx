"use client";

import { useActionState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import type { ContentActionState } from "@/lib/content-forms";
import { createCompanyRoom } from "./actions";

/**
 * Inline "new standup room" form. On success the server action revalidates the
 * page (so the new card appears) and we clear the inputs for the next one.
 */
export function CreateRoomForm() {
  const [state, formAction] = useActionState<ContentActionState, FormData>(
    createCompanyRoom,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <h2 className="text-sm font-semibold tracking-tight">New standup room</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Always-on internal video room. Any staff member can join; you can record calls.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.5fr_auto] sm:items-end">
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" placeholder="e.g. Design Standup" required />
        </Field>
        <Field label="Description" htmlFor="description">
          <span>Optional</span>
          <Input id="description" name="description" placeholder="What this room is for?" />
        </Field>
        <SubmitButton>Create room</SubmitButton>
      </div>

      <FormError error={state.error} />
    </form>
  );
}

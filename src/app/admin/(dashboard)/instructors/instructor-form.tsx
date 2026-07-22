"use client";

import { useActionState } from "react";
import type { Instructor } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import type { ContentActionState } from "@/lib/content-forms";

type Action = (prev: ContentActionState, fd: FormData) => Promise<ContentActionState>;

export function InstructorForm({
  action,
  instructor,
  email,
}: {
  action: Action;
  instructor?: Instructor;
  email?: string;
}) {
  const [state, formAction] = useActionState<ContentActionState, FormData>(action, {});
  const editing = Boolean(instructor);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {instructor && <input type="hidden" name="id" value={instructor.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={instructor?.name} required />
        </Field>
        <Field label="Title" htmlFor="title" hint="e.g. Lead Engineer, H-SETS">
          <Input id="title" name="title" defaultValue={instructor?.title} required />
        </Field>
      </div>

      <Field label="Bio" htmlFor="bio">
        <Textarea id="bio" name="bio" rows={4} defaultValue={instructor?.bio} required />
      </Field>

      <Field label="Sort order" htmlFor="sortOrder" hint="Lower shows first">
        <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={instructor?.sortOrder ?? 0} />
      </Field>

      <fieldset className="grid gap-5 rounded-2xl border border-border p-5 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold">Login account</legend>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={email} required />
        </Field>
        <Field
          label={editing ? "New password" : "Temporary password"}
          htmlFor="password"
          hint={editing ? "Leave blank to keep current" : "Minimum 8 characters"}
        >
          <Input id="password" name="password" type="password" required={!editing} />
        </Field>
      </fieldset>

      <FormError error={state.error} />
      <SubmitButton>{instructor ? "Save changes" : "Create instructor"}</SubmitButton>
    </form>
  );
}

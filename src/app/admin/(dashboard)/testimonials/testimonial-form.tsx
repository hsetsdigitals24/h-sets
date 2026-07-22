"use client";

import { useActionState } from "react";
import type { Testimonial } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, FormError, PublishedField } from "@/components/admin/form-kit";
import type { ContentActionState } from "@/lib/content-forms";

type Action = (prev: ContentActionState, fd: FormData) => Promise<ContentActionState>;

export function TestimonialForm({
  action,
  testimonial,
}: {
  action: Action;
  testimonial?: Testimonial;
}) {
  const [state, formAction] = useActionState<ContentActionState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={testimonial?.name} required />
        </Field>
        <Field label="Initials" htmlFor="initials" hint="Up to 4 characters">
          <Input id="initials" name="initials" maxLength={4} defaultValue={testimonial?.initials} required />
        </Field>
        <Field label="Role" htmlFor="role">
          <Input id="role" name="role" defaultValue={testimonial?.role} required />
        </Field>
        <Field label="Company" htmlFor="company">
          <Input id="company" name="company" defaultValue={testimonial?.company} required />
        </Field>
        <Field label="Rating (1–5)" htmlFor="rating">
          <Input id="rating" name="rating" type="number" min={1} max={5} defaultValue={testimonial?.rating ?? 5} required />
        </Field>
        <Field label="Sort order" htmlFor="sortOrder" hint="Lower shows first">
          <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={testimonial?.sortOrder ?? 0} />
        </Field>
      </div>

      <Field label="Quote" htmlFor="quote">
        <Textarea id="quote" name="quote" rows={4} defaultValue={testimonial?.quote} required />
      </Field>

      <PublishedField defaultChecked={testimonial?.published ?? true} />

      <FormError error={state.error} />
      <SubmitButton>{testimonial ? "Save changes" : "Create testimonial"}</SubmitButton>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import type { Insight } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, FormError, PublishedField } from "@/components/admin/form-kit";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { bodyToHtml, type ContentActionState } from "@/lib/content-forms";

type Action = (prev: ContentActionState, fd: FormData) => Promise<ContentActionState>;

export function InsightForm({ action, insight }: { action: Action; insight?: Insight }) {
  const [state, formAction] = useActionState<ContentActionState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {insight && <input type="hidden" name="id" value={insight.id} />}

      <Field label="Title" htmlFor="title">
        <Input id="title" name="title" defaultValue={insight?.title} required />
      </Field>
      <Field label="Slug" htmlFor="slug" hint="Leave blank to auto-generate from the title.">
        <Input id="slug" name="slug" defaultValue={insight?.slug} placeholder="my-post-slug" />
      </Field>
      <Field label="Excerpt" htmlFor="excerpt">
        <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={insight?.excerpt} required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" htmlFor="category">
          <Input id="category" name="category" defaultValue={insight?.category} required />
        </Field>
        <Field label="Accent" htmlFor="accent" hint="Tailwind class, e.g. bg-blue-500">
          <Input id="accent" name="accent" defaultValue={insight?.accent ?? "bg-blue-500"} required />
        </Field>
        <Field label="Author" htmlFor="author">
          <Input id="author" name="author" defaultValue={insight?.author} required />
        </Field>
        <Field label="Author role" htmlFor="authorRole">
          <Input id="authorRole" name="authorRole" defaultValue={insight?.authorRole} required />
        </Field>
        <Field label="Date" htmlFor="date">
          <Input id="date" name="date" type="date" defaultValue={insight?.date} required />
        </Field>
        <Field label="Read time (mins)" htmlFor="readMins">
          <Input id="readMins" name="readMins" type="number" min={1} max={120} defaultValue={insight?.readMins ?? 5} required />
        </Field>
      </div>

      <Field label="Body" hint="Rich text — headings, formatting, links, and images.">
        <RichTextEditor name="body" defaultHTML={bodyToHtml(insight?.body)} />
      </Field>

      <PublishedField defaultChecked={insight?.published ?? true} />

      <FormError error={state.error} />
      <SubmitButton>{insight ? "Save changes" : "Create insight"}</SubmitButton>
    </form>
  );
}

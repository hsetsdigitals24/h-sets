"use client";

import { useActionState } from "react";
import type { Portfolio } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, FormError, PublishedField } from "@/components/admin/form-kit";
import { ResultsField } from "@/components/admin/results-field";
import { TestimonialField } from "@/components/admin/testimonial-field";
import { ThumbnailCapture } from "@/components/admin/thumbnail-capture";
import { arrayToLines, type ContentActionState } from "@/lib/content-forms";

type Action = (prev: ContentActionState, fd: FormData) => Promise<ContentActionState>;

export function PortfolioForm({ action, item }: { action: Action; item?: Portfolio }) {
  const [state, formAction] = useActionState<ContentActionState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {item && <input type="hidden" name="id" value={item.id} />}

      <Field label="Title" htmlFor="title">
        <Input id="title" name="title" defaultValue={item?.title} required />
      </Field>
      <Field label="Slug" htmlFor="slug" hint="Blank = from title">
        <Input id="slug" name="slug" defaultValue={item?.slug} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Client" htmlFor="client">
          <Input id="client" name="client" defaultValue={item?.client} required />
        </Field>
        <Field label="Industry" htmlFor="industry">
          <Input id="industry" name="industry" defaultValue={item?.industry} required />
        </Field>
        <Field label="Service" htmlFor="service">
          <Input id="service" name="service" defaultValue={item?.service} required />
        </Field>
        <Field
          label="Accent"
          htmlFor="accent"
          hint="Tailwind class, e.g. bg-blue-500 — used as the card fallback when no thumbnail is captured."
        >
          <Input id="accent" name="accent" defaultValue={item?.accent ?? "bg-blue-500"} required />
        </Field>
      </div>

      <ThumbnailCapture
        defaultSourceUrl={item?.sourceUrl}
        defaultThumbnail={item?.thumbnail}
      />

      <Field label="Summary" htmlFor="summary">
        <Textarea id="summary" name="summary" rows={2} defaultValue={item?.summary} required />
      </Field>
      <Field label="Challenge" htmlFor="challenge">
        <Textarea id="challenge" name="challenge" rows={4} defaultValue={item?.challenge} required />
      </Field>
      <Field label="Solution" htmlFor="solution">
        <Textarea id="solution" name="solution" rows={4} defaultValue={item?.solution} required />
      </Field>

      <Field label="Technologies" htmlFor="tech" hint="One per line.">
        <Textarea id="tech" name="tech" rows={4} defaultValue={arrayToLines(item?.tech)} />
      </Field>
      <Field label="Related slugs" htmlFor="related" hint="One per line.">
        <Textarea id="related" name="related" rows={3} defaultValue={arrayToLines(item?.related)} />
      </Field>

      <ResultsField defaultValue={(item?.results as { metric: string; label: string }[]) ?? []} />
      <TestimonialField
        defaultValue={item?.testimonial as { quote: string; name: string; role: string } | null}
      />

      <PublishedField defaultChecked={item?.published ?? true} />

      <FormError error={state.error} />
      <SubmitButton>{item ? "Save changes" : "Create portfolio item"}</SubmitButton>
    </form>
  );
}

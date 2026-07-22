"use client";

import { useActionState } from "react";
import type { Resource } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, FormError, PublishedField } from "@/components/admin/form-kit";
import { FileUpload } from "@/components/lms/file-upload";
import { ICON_NAMES } from "@/lib/icon-map";
import type { ContentActionState } from "@/lib/content-forms";
import { requestResourceUpload } from "./actions";

type Action = (prev: ContentActionState, fd: FormData) => Promise<ContentActionState>;

const GATES: { value: string; label: string }[] = [
  { value: "email", label: "Email only" },
  { value: "emailRole", label: "Email + role" },
  { value: "emailCompany", label: "Email + company" },
  { value: "full", label: "Full form (+ phone)" },
];

export function ResourceForm({ action, resource }: { action: Action; resource?: Resource }) {
  const [state, formAction] = useActionState<ContentActionState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {resource && <input type="hidden" name="id" value={resource.id} />}

      <Field label="Title" htmlFor="title">
        <Input id="title" name="title" defaultValue={resource?.title} required />
      </Field>
      <Field label="Slug" htmlFor="slug" hint="Leave blank to auto-generate from the title.">
        <Input id="slug" name="slug" defaultValue={resource?.slug} />
      </Field>
      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={3} defaultValue={resource?.description} required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type" htmlFor="type" hint="e.g. E-Book, Template, Checklist">
          <Input id="type" name="type" defaultValue={resource?.type} required />
        </Field>
        <Field label="Tag" htmlFor="tag" hint="e.g. For business leaders">
          <Input id="tag" name="tag" defaultValue={resource?.tag} required />
        </Field>
        <Field label="Icon" htmlFor="icon">
          <Select id="icon" name="icon" defaultValue={resource?.icon ?? "BookOpen"}>
            {ICON_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Gate" htmlFor="gate">
          <Select id="gate" name="gate" defaultValue={resource?.gate ?? "email"}>
            {GATES.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Accent" htmlFor="accent" hint="Tailwind class, e.g. bg-blue-500">
          <Input id="accent" name="accent" defaultValue={resource?.accent ?? "bg-blue-500"} required />
        </Field>
        <Field label="Sort order" htmlFor="sortOrder" hint="Lower shows first">
          <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={resource?.sortOrder ?? 0} />
        </Field>
      </div>

      <Field
        label="PDF file"
        htmlFor="resource-file"
        hint={
          resource?.fileName
            ? `Current file: ${resource.fileName}. Upload a new one to replace it.`
            : "Upload the PDF users will download."
        }
      >
        <FileUpload getUploadUrl={requestResourceUpload} accept=".pdf,application/pdf" />
      </Field>

      <PublishedField defaultChecked={resource?.published ?? true} />

      <FormError error={state.error} />
      <SubmitButton>{resource ? "Save changes" : "Create resource"}</SubmitButton>
    </form>
  );
}

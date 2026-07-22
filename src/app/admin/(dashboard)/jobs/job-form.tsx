"use client";

import { useActionState } from "react";
import type { Job } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, FormError, PublishedField } from "@/components/admin/form-kit";
import type { ContentActionState } from "@/lib/content-forms";

type Action = (prev: ContentActionState, fd: FormData) => Promise<ContentActionState>;

export function JobForm({ action, job }: { action: Action; job?: Job }) {
  const [state, formAction] = useActionState<ContentActionState, FormData>(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {job && <input type="hidden" name="id" value={job.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Job title" htmlFor="title">
          <Input id="title" name="title" defaultValue={job?.title} required />
        </Field>
        <Field label="Company" htmlFor="company">
          <Input id="company" name="company" defaultValue={job?.company} required />
        </Field>
        <Field label="Type" htmlFor="type">
          <Select id="type" name="type" defaultValue={job?.type ?? "Full-time"}>
            <option value="Internship">Internship</option>
            <option value="Graduate">Graduate</option>
            <option value="Full-time">Full-time</option>
          </Select>
        </Field>
        <Field label="Work mode" htmlFor="mode">
          <Select id="mode" name="mode" defaultValue={job?.mode ?? "Remote"}>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </Select>
        </Field>
        <Field label="Location" htmlFor="location">
          <Input id="location" name="location" defaultValue={job?.location} required />
        </Field>
        <Field label="Category" htmlFor="category">
          <Input id="category" name="category" defaultValue={job?.category} required />
        </Field>
        <Field label="Salary" htmlFor="salary">
          <Input id="salary" name="salary" defaultValue={job?.salary} placeholder="₦400k – ₦650k / mo" required />
        </Field>
        <Field label="" htmlFor="published">
          <PublishedField defaultChecked={job?.published ?? true} />
        </Field>
        <Field label="Posted date" htmlFor="posted">
          <Input id="posted" name="posted" type="date" defaultValue={job?.posted} required />
        </Field>
        <Field label="Application deadline" htmlFor="deadline">
          <Input id="deadline" name="deadline" type="date" defaultValue={job?.deadline} required />
        </Field>
      </div>

      <Field label="Summary" htmlFor="summary">
        <Textarea id="summary" name="summary" rows={4} defaultValue={job?.summary} required />
      </Field>

      <FormError error={state.error} />
      <SubmitButton>{job ? "Save changes" : "Create job"}</SubmitButton>
    </form>
  );
}

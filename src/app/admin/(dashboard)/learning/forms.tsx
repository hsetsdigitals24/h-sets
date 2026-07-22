"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import { FileUpload } from "@/components/lms/file-upload";
import type { ContentActionState } from "@/lib/content-forms";
import {
  createModule,
  createLesson,
  createMaterial,
  requestMaterialUpload,
} from "./actions";

function useResetOnOk(state: ContentActionState, formRef: React.RefObject<HTMLFormElement | null>, msg: string) {
  useEffect(() => {
    if (state.ok) {
      toast.success(msg);
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, formRef, msg]);
}

export function AddModuleForm({ cohortId }: { cohortId: string }) {
  const [state, action] = useActionState<ContentActionState, FormData>(createModule, {});
  const ref = useRef<HTMLFormElement>(null);
  useResetOnOk(state, ref, "Module added");
  return (
    <form ref={ref} action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="cohortId" value={cohortId} />
      <div className="min-w-[240px] flex-1">
        <Field label="New module" htmlFor="mod-title">
          <Input id="mod-title" name="title" placeholder="e.g. Week 1 — Foundations" required />
        </Field>
      </div>
      <SubmitButton>Add module</SubmitButton>
      <div className="w-full">
        <FormError error={state.error} />
      </div>
    </form>
  );
}

export function AddLessonForm({ moduleId }: { moduleId: string }) {
  const [state, action] = useActionState<ContentActionState, FormData>(createLesson, {});
  const ref = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  useResetOnOk(state, ref, "Lesson added");

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Add lesson
      </Button>
    );
  }
  return (
    <form ref={ref} action={action} className="space-y-3 rounded-xl border border-border p-4">
      <input type="hidden" name="moduleId" value={moduleId} />
      <Field label="Lesson title" htmlFor={`lesson-${moduleId}`}>
        <Input id={`lesson-${moduleId}`} name="title" required />
      </Field>
      <Field label="Notes" htmlFor={`body-${moduleId}`} hint="One paragraph per line (optional).">
        <Textarea id={`body-${moduleId}`} name="body" rows={3} />
      </Field>
      <Field label="Live session link" htmlFor={`live-${moduleId}`} hint="Zoom / Google Meet URL (optional).">
        <Input id={`live-${moduleId}`} name="liveUrl" type="url" placeholder="https://" />
      </Field>
      <div className="flex items-center gap-2">
        <SubmitButton>Save lesson</SubmitButton>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      <FormError error={state.error} />
    </form>
  );
}

export function AddMaterialForm({ lessonId }: { lessonId: string }) {
  const [state, action] = useActionState<ContentActionState, FormData>(createMaterial, {});
  const ref = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"upload" | "link">("upload");
  useResetOnOk(state, ref, "Material added");

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" /> Add material
      </Button>
    );
  }
  return (
    <form ref={ref} action={action} className="space-y-3 rounded-xl border border-border p-4">
      <input type="hidden" name="lessonId" value={lessonId} />
      <Field label="Title" htmlFor={`mat-title-${lessonId}`}>
        <Input id={`mat-title-${lessonId}`} name="title" placeholder="e.g. Lecture slides" required />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Type" htmlFor={`mat-kind-${lessonId}`}>
          <Select id={`mat-kind-${lessonId}`} name="kind" defaultValue="pdf">
            <option value="pdf">PDF</option>
            <option value="doc">Document</option>
            <option value="slide">Slides</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Source">
          <Select value={mode} onChange={(e) => setMode(e.target.value as "upload" | "link")}>
            <option value="upload">Upload a file</option>
            <option value="link">External link</option>
          </Select>
        </Field>
      </div>
      {mode === "upload" ? (
        <FileUpload getUploadUrl={requestMaterialUpload} />
      ) : (
        <Field label="URL" htmlFor={`mat-url-${lessonId}`}>
          <Input id={`mat-url-${lessonId}`} name="url" type="url" placeholder="https://" />
        </Field>
      )}
      <div className="flex items-center gap-2">
        <SubmitButton>Save material</SubmitButton>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      <FormError error={state.error} />
    </form>
  );
}

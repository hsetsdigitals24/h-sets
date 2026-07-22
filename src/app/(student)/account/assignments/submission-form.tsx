"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import { FileUpload } from "@/components/lms/file-upload";
import type { ContentActionState } from "@/lib/content-forms";
import { submitAssignment, requestSubmissionUpload } from "@/app/(student)/actions";

export function SubmissionForm({
  assignmentId,
  submitted,
}: {
  assignmentId: string;
  submitted: boolean;
}) {
  const [state, action] = useActionState<ContentActionState, FormData>(submitAssignment, {});

  useEffect(() => {
    if (state.ok) toast.success("Submission saved");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <Field label="Written response or link" htmlFor="text" hint="Paste your answer or a project URL (optional if you upload a file).">
        <Textarea id="text" name="text" rows={5} />
      </Field>
      <Field label="Attach a file" hint="Optional — PDF, DOCX, ZIP, etc.">
        <FileUpload getUploadUrl={requestSubmissionUpload} />
      </Field>
      <FormError error={state.error} />
      <SubmitButton>{submitted ? "Update submission" : "Submit assignment"}</SubmitButton>
    </form>
  );
}

"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import type { ContentActionState } from "@/lib/content-forms";
import { enrollStudent } from "./actions";

export function EnrollForm({ cohortId }: { cohortId: string }) {
  const [state, formAction] = useActionState<ContentActionState, FormData>(enrollStudent, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Student enrolled");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="cohortId" value={cohortId} />
      <div className="min-w-[260px] flex-1">
        <Field label="Student email" htmlFor="email" hint="The student must have a registered account.">
          <Input id="email" name="email" type="email" placeholder="student@example.com" required />
        </Field>
      </div>
      <SubmitButton>Enroll student</SubmitButton>
      <div className="w-full">
        <FormError error={state.error} />
      </div>
    </form>
  );
}

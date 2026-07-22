"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import { ROLE_LABELS } from "@/lib/rbac";
import type { ContentActionState } from "@/lib/content-forms";
import { broadcastNotification } from "./actions";

export function BroadcastForm() {
  const [state, formAction] = useActionState<ContentActionState, FormData>(
    broadcastNotification,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Announcement sent");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      <Field label="Audience" htmlFor="audience">
        <Select id="audience" name="audience" defaultValue="all">
          <option value="all">Everyone</option>
          <option value="students">All students</option>
          {Object.values(Role)
            .filter((r) => r !== Role.STUDENT)
            .map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]} (staff)
              </option>
            ))}
        </Select>
      </Field>
      <Field label="Title" htmlFor="title">
        <Input id="title" name="title" required maxLength={140} placeholder="e.g. Platform maintenance this weekend" />
      </Field>
      <Field label="Message" htmlFor="body" hint="Optional details shown beneath the title">
        <Textarea id="body" name="body" rows={4} maxLength={1000} />
      </Field>
      <Field label="Link" htmlFor="link" hint="Optional in-app path, e.g. /academy">
        <Input id="link" name="link" placeholder="/academy" />
      </Field>
      <FormError error={state.error} />
      <div>
        <SubmitButton>Send announcement</SubmitButton>
      </div>
    </form>
  );
}

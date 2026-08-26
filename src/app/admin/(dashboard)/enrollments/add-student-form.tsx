"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import { addNewStudent, type AddStudentState } from "./actions";

function CredentialsCard({
  credentials,
}: {
  credentials: NonNullable<AddStudentState["credentials"]>;
}) {
  const [copied, setCopied] = useState(false);

  const summary = `H-SETS Academy login\nEmail: ${credentials.email}\nTemporary password: ${credentials.password}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — copy the details manually.");
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Account created — share these login details</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {credentials.name} can sign in at <span className="font-medium">/login</span> and change
            their password from Account → Security. This password won&apos;t be shown again.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex gap-2">
          <dt className="w-32 shrink-0 text-muted-foreground">Email</dt>
          <dd className="font-mono font-medium break-all">{credentials.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-32 shrink-0 text-muted-foreground">Temp password</dt>
          <dd className="font-mono font-medium break-all">{credentials.password}</dd>
        </div>
      </dl>
    </div>
  );
}

export function AddStudentForm({ cohortId }: { cohortId: string }) {
  const [state, formAction] = useActionState<AddStudentState, FormData>(addNewStudent, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Student account created and enrolled");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div>
      <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="cohortId" value={cohortId} />
        <div className="min-w-[180px] flex-1">
          <Field label="Full name" htmlFor="name">
            <Input id="name" name="name" placeholder="Ada Obi" required />
          </Field>
        </div>
        <div className="min-w-[220px] flex-1">
          <Field label="Email" htmlFor="add-email">
            <Input id="add-email" name="email" type="email" placeholder="student@example.com" required />
          </Field>
        </div>
        <div className="min-w-[180px] flex-1">
          <Field
            label="Password"
            htmlFor="add-password"
            hint="Leave blank to auto-generate one."
          >
            <Input id="add-password" name="password" type="text" placeholder="Auto-generated" />
          </Field>
        </div>
        <SubmitButton>Create &amp; enroll</SubmitButton>
        <div className="w-full">
          <FormError error={state.error} />
        </div>
      </form>

      {state.ok && state.credentials && <CredentialsCard credentials={state.credentials} />}
    </div>
  );
}

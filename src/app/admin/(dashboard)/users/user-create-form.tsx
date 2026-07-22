"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import { ROLE_LABELS } from "@/lib/rbac";
import type { ContentActionState } from "@/lib/content-forms";
import { createUser } from "./actions";

export function UserCreateForm() {
  const [state, formAction] = useActionState<ContentActionState, FormData>(createUser, {});
  const formRef = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState<Role>(Role.MARKETING_ADMIN);

  useEffect(() => {
    if (state.ok) {
      toast.success("Team member added");
      formRef.current?.reset();
      setRole(Role.MARKETING_ADMIN);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" required />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" required />
      </Field>
      <Field label="Role" htmlFor="role">
        <Select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {Object.values(Role)
            .filter((r) => r !== Role.STUDENT)
            .map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
        </Select>
      </Field>
      <Field label="Temporary password" htmlFor="password" hint="Minimum 8 characters">
        <Input id="password" name="password" type="password" required />
      </Field>
      {role === Role.INSTRUCTOR && (
        <>
          <Field
            label="Title"
            htmlFor="title"
            hint="e.g. Lead Engineer, H-SETS"
          >
            <Input id="title" name="title" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Bio" htmlFor="bio" hint="Shown on their public instructor profile">
              <Textarea id="bio" name="bio" rows={4} />
            </Field>
          </div>
        </>
      )}
      <div className="sm:col-span-2 space-y-3">
        <FormError error={state.error} />
        <SubmitButton>Add team member</SubmitButton>
      </div>
    </form>
  );
}

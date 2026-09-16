"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import { AvatarUpload } from "@/components/admin/avatar-upload";
import type { ContentActionState } from "@/lib/content-forms";
import { updateProfile, presignAvatarUpload } from "./actions";

export type StaffProfile = {
  name: string;
  image: string | null;
  jobTitle: string | null;
  phone: string | null;
  bio: string | null;
};

export function ProfileForm({ profile }: { profile: StaffProfile }) {
  const [state, formAction] = useActionState<ContentActionState, FormData>(
    updateProfile,
    {}
  );

  useEffect(() => {
    if (state.ok) toast.success("Profile updated");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <AvatarUpload
        name={profile.name}
        defaultUrl={profile.image}
        getUploadUrl={presignAvatarUpload}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name">
          <Input id="name" name="name" defaultValue={profile.name} required />
        </Field>
        <Field label="Job title" htmlFor="jobTitle" hint="e.g. Academy Manager">
          <Input
            id="jobTitle"
            name="jobTitle"
            defaultValue={profile.jobTitle ?? ""}
            placeholder="Your role at H-SETS"
          />
        </Field>
        <Field label="Phone" htmlFor="phone" hint="Visible to the team only">
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
            placeholder="+234…"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="About" htmlFor="bio" hint="A short introduction for your colleagues">
            <Textarea id="bio" name="bio" rows={4} defaultValue={profile.bio ?? ""} />
          </Field>
        </div>
      </div>

      <FormError error={state.error} />
      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}

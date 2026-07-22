"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function SubmitButton({ children = "Save" }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : children}
    </Button>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
      {error}
    </p>
  );
}

/** A published on/off toggle bound to a hidden input named `published`. */
export function PublishedField({ defaultChecked = true }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
      <div>
        <div className="text-sm font-medium">Published</div>
        <p className="text-xs text-muted-foreground">
          Visible on the public website when on.
        </p>
      </div>
      <input type="hidden" name="published" value={checked ? "true" : "false"} />
      <Switch checked={checked} onCheckedChange={setChecked} aria-label="Published" />
    </div>
  );
}

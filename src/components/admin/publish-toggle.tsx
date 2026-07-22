"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

/**
 * Reusable published on/off toggle. Accepts a bound server action that takes
 * FormData with `id` and `published` and persists the change.
 */
export function PublishToggle({
  id,
  published,
  action,
}: {
  id: string;
  published: boolean;
  action: (formData: FormData) => Promise<{ ok?: boolean; error?: string } | void>;
}) {
  const [checked, setChecked] = useState(published);
  const [pending, startTransition] = useTransition();

  function onToggle(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("published", next ? "true" : "false");
      const res = await action(fd);
      if (res && "error" in res && res.error) {
        setChecked(!next); // revert
        toast.error(res.error);
      } else {
        toast.success(next ? "Published" : "Unpublished");
      }
    });
  }

  return (
    <Switch
      checked={checked}
      onCheckedChange={onToggle}
      disabled={pending}
      aria-label="Toggle published"
    />
  );
}

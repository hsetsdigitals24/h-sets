"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Delete control with a confirmation prompt. Accepts a bound server action
 * taking FormData with `id`.
 */
export function DeleteButton({
  id,
  action,
  label = "Delete",
  confirmText = "Delete this item? This cannot be undone.",
}: {
  id: string;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  label?: string;
  confirmText?: string;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm(confirmText)) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const res = await action(fd);
      if (res && "error" in res && res.error) toast.error(res.error);
      else toast.success("Deleted");
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-destructive"
      disabled={pending}
      onClick={onClick}
    >
      <Trash2 className="size-4" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}

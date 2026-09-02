"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

/**
 * Delete control with a confirmation modal. Accepts a bound server action
 * taking FormData with `id`.
 */
export function DeleteButton({
  id,
  action,
  label = "Delete",
  confirmText = "Delete this item? This cannot be undone.",
  showLabel = false,
  className,
}: {
  id: string;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  label?: string;
  confirmText?: string;
  showLabel?: boolean;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function onConfirm() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const res = await action(fd);
      if (res && "error" in res && res.error) toast.error(res.error);
      else toast.success("Deleted");
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("text-destructive", className)}
        disabled={pending}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
        <span className={showLabel ? undefined : "sr-only"}>{label}</span>
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Confirm deletion"
        description={confirmText}
        confirmLabel={label}
        destructive
        pending={pending}
        onConfirm={onConfirm}
      />
    </>
  );
}

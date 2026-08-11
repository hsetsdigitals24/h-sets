"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteCompanyRoom } from "./actions";

/**
 * Delete a standup room (super-admin only; the server action re-checks). Guards
 * with a confirm dialog since deletion also removes the room's recordings.
 */
export function DeleteRoomButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const res = await deleteCompanyRoom(fd);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Room deleted");
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Delete ${name}`}
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Delete "${name}"?`}
        description="This removes the room and its recordings. This can't be undone."
        confirmLabel="Delete room"
        destructive
        pending={pending}
        onConfirm={confirm}
      />
    </>
  );
}

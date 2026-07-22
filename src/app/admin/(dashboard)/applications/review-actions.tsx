"use client";

import { useState, useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { approveApplication, rejectApplication } from "./actions";

/** Approve / Reject controls for a pending application row. */
export function ReviewActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");

  function approve() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const res = await approveApplication(fd);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success("Application approved — student enrolled.");
        setApproveOpen(false);
      }
    });
  }

  function reject() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      if (note.trim()) fd.set("reviewNote", note.trim());
      const res = await rejectApplication(fd);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success("Application rejected.");
        setNote("");
        setRejectOpen(false);
      }
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        size="sm"
        variant="gradient"
        disabled={pending}
        onClick={() => setApproveOpen(true)}
      >
        <Check className="size-4" /> Approve
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-destructive"
        disabled={pending}
        onClick={() => setRejectOpen(true)}
      >
        <X className="size-4" /> Reject
      </Button>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve application</DialogTitle>
            <DialogDescription>
              This creates the student&apos;s account and enrolls them.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" variant="gradient" disabled={pending} onClick={approve}>
              <Check className="size-4" /> Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>
              The applicant will be notified. You can add an optional note.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 text-left">
            <Label htmlFor={`reject-note-${id}`}>Note (shared internally)</Label>
            <Textarea
              id={`reject-note-${id}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional — reason for rejection"
              disabled={pending}
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              disabled={pending}
              onClick={reject}
            >
              <X className="size-4" /> Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

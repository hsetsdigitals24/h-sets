"use client";

import { useState, useTransition } from "react";
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
import { submitExamForReview } from "../actions";

/** Opens a confirmation modal before submitting a draft/rejected exam for admin review. */
export function SubmitForReviewButton({ examId }: { examId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("examId", examId);
      const res = await submitExamForReview(fd);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success("Submitted for review");
        setOpen(false);
      }
    });
  }

  return (
    <>
      <Button type="button" variant="gradient" onClick={() => setOpen(true)}>
        Submit for review
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for review</DialogTitle>
            <DialogDescription>
              This sends the exam to an admin for review. You won&apos;t be able to edit it
              while it&apos;s pending review.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" variant="gradient" disabled={pending} onClick={submit}>
              Submit for review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Check, X, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { markReviewed, rejectJobApplication, getCvDownloadUrl } from "./actions";

/** Download-CV button, usable on any row that has a CV attached. */
export function DownloadCv({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  function download() {
    startTransition(async () => {
      const res = await getCvDownloadUrl(id);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        window.open(res.url, "_blank", "noopener,noreferrer");
      }
    });
  }
  return (
    <Button type="button" size="sm" variant="outline" disabled={pending} onClick={download}>
      <Download className="size-4" /> CV
    </Button>
  );
}

/** Mark reviewed / Reject controls for a pending job application. */
export function ReviewActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");

  function review() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      const res = await markReviewed(fd);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
      } else {
        toast.success("Marked as reviewed.");
      }
    });
  }

  function reject() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      if (note.trim()) fd.set("reviewNote", note.trim());
      const res = await rejectJobApplication(fd);
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
      <Button type="button" size="sm" variant="gradient" disabled={pending} onClick={review}>
        <Check className="size-4" /> Reviewed
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

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>
              The applicant will be emailed. You can add an optional internal note.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 text-left">
            <Label htmlFor={`reject-note-${id}`}>Note (internal)</Label>
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

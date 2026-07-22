"use client";

import * as React from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import type { Job } from "@/data/jobs";
import { submitForm } from "@/lib/api";
import { jobApplicationSchema } from "@/lib/schemas";
import { requestCvUpload } from "@/app/(marketing)/careers/actions";
import { FileUpload } from "@/components/lms/file-upload";
import { Field } from "@/components/forms/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/** Public, no-login application form for a single job, shown in a modal. */
export function JobApplyDialog({ job }: { job: Job }) {
  const [open, setOpen] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      jobId: job.id,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? "") || undefined,
      coverNote: String(fd.get("coverNote") ?? ""),
      cvKey: String(fd.get("cvKey") ?? ""),
      cvFileName: String(fd.get("cvFileName") ?? ""),
    };

    const parsed = jobApplicationSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form and try again.");
      return;
    }

    setSubmitting(true);
    try {
      await submitForm("job-application", parsed.data);
      setDone(true);
    } catch (err) {
      toast.error("Couldn't submit your application", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    // Reset the success state a moment after closing so re-opening is fresh.
    if (!next) setTimeout(() => setDone(false), 200);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="gradient" className="shrink-0">
          Apply
          <ArrowUpRight className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="size-12 text-emerald-500" />
            <h3 className="text-xl font-semibold">Application received</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Thanks for applying to <strong>{job.title}</strong> at {job.company}. Our careers
              team will review your application and email you if there&apos;s a fit.
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Apply — {job.title}</DialogTitle>
              <DialogDescription>
                {job.company} · {job.location} · {job.mode}. No account needed.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="name" required>
                  <Input id="name" name="name" placeholder="Ada Lovelace" required />
                </Field>
                <Field label="Email" htmlFor="email" required>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    required
                  />
                </Field>
              </div>
              <Field label="Phone" htmlFor="phone">
                <Input id="phone" name="phone" placeholder="Optional" />
              </Field>
              <Field label="Why are you a fit?" htmlFor="coverNote" required>
                <Textarea
                  id="coverNote"
                  name="coverNote"
                  rows={4}
                  placeholder="A short note on your experience and why you're interested…"
                  required
                />
              </Field>
              <Field label="CV / Résumé (PDF or Word)" htmlFor="cv" required>
                <FileUpload
                  getUploadUrl={requestCvUpload}
                  accept=".pdf,.doc,.docx"
                  keyName="cvKey"
                  fileNameField="cvFileName"
                  required
                />
              </Field>
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Submit application
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

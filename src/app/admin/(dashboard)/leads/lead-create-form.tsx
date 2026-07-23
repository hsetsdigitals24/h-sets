"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import { LEAD_TYPES, LEAD_STATUSES, STATUS_LABELS } from "@/lib/leads";
import { createLead, type LeadActionState } from "./actions";

export function LeadCreateForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<LeadActionState, FormData>(createLead, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Lead added");
      formRef.current?.reset();
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Lead</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a lead</DialogTitle>
          <DialogDescription>
            Manually record a lead captured by phone, email, or at an event.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" required />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" />
          </Field>
          <Field label="Company" htmlFor="company">
            <Input id="company" name="company" />
          </Field>
          <Field label="Source" htmlFor="source" hint="Defaults to “manual”">
            <Input id="source" name="source" placeholder="e.g. phone call, referral" />
          </Field>
          <Field label="Type" htmlFor="type">
            <Select id="type" name="type" defaultValue="contact">
              {LEAD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue="new">
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Score" htmlFor="score" hint="0–100">
            <Input id="score" name="score" type="number" min={0} max={100} defaultValue={0} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes" htmlFor="notes" hint="Internal — not shown to the lead">
              <Textarea id="notes" name="notes" rows={3} />
            </Field>
          </div>
          <div className="sm:col-span-2 space-y-3">
            <FormError error={state.error} />
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <SubmitButton>Add lead</SubmitButton>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

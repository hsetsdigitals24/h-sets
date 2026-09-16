"use client";

import { useActionState, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
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
import { LEAD_TYPES } from "@/lib/leads";
import { updateLeadDetails, type LeadActionState } from "./actions";

export type LeadDetails = {
  id: string;
  type: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
};

export function LeadDetailsForm({ lead }: { lead: LeadDetails }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<LeadActionState, FormData>(
    updateLeadDetails,
    {}
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Lead details updated");
      // Close the dialog once the server action reports success.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="size-4" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit contact details</DialogTitle>
          <DialogDescription>
            Correct or complete the information captured for this lead.
          </DialogDescription>
        </DialogHeader>
        {/* Remounts on reopen so the inputs reset to the saved values. */}
        <form
          key={open ? "open" : "closed"}
          action={formAction}
          className="grid gap-4 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={lead.id} />
          <Field label="Name" htmlFor="edit-name">
            <Input id="edit-name" name="name" defaultValue={lead.name ?? ""} required />
          </Field>
          <Field label="Email" htmlFor="edit-email">
            <Input
              id="edit-email"
              name="email"
              type="email"
              defaultValue={lead.email ?? ""}
            />
          </Field>
          <Field label="Phone" htmlFor="edit-phone">
            <Input id="edit-phone" name="phone" defaultValue={lead.phone ?? ""} />
          </Field>
          <Field label="Company" htmlFor="edit-company">
            <Input id="edit-company" name="company" defaultValue={lead.company ?? ""} />
          </Field>
          <Field label="Source" htmlFor="edit-source">
            <Input
              id="edit-source"
              name="source"
              defaultValue={lead.source ?? ""}
              placeholder="e.g. phone call, referral"
            />
          </Field>
          <Field label="Type" htmlFor="edit-type">
            <Select id="edit-type" name="type" defaultValue={lead.type}>
              {LEAD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2 space-y-3">
            <FormError error={state.error} />
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <SubmitButton>Save details</SubmitButton>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

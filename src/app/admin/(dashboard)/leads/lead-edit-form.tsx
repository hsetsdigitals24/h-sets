"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LEAD_STATUSES, STATUS_LABELS } from "@/lib/leads";
import { updateLead, type LeadActionState } from "./actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function LeadEditForm({
  id,
  status,
  score,
  notes,
}: {
  id: string;
  status: string;
  score: number;
  notes: string | null;
}) {
  const [state, formAction] = useActionState<LeadActionState, FormData>(
    updateLead,
    {}
  );

  useEffect(() => {
    if (state.ok) toast.success("Lead updated");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <div className="space-y-1.5">
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={status}>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="score">Lead score (0–100)</Label>
        <Input
          id="score"
          name="score"
          type="number"
          min={0}
          max={100}
          defaultValue={score}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Internal notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={notes ?? ""}
          placeholder="Add follow-up notes…"
        />
      </div>
      <SaveButton />
    </form>
  );
}

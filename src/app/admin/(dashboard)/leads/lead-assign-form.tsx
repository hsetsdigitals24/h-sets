"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { assignLead, type LeadActionState } from "./actions";

type Owner = { id: string; name: string };

function AssignButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "Saving…" : "Assign"}
    </Button>
  );
}

export function LeadAssignForm({
  id,
  ownerId,
  owners,
}: {
  id: string;
  ownerId: string | null;
  owners: Owner[];
}) {
  const [state, formAction] = useActionState<LeadActionState, FormData>(
    assignLead,
    {}
  );

  useEffect(() => {
    if (state.ok) toast.success("Assignment updated");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="ownerId">Owner</Label>
        <Select id="ownerId" name="ownerId" defaultValue={ownerId ?? ""}>
          <option value="">Unassigned</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
      </div>
      <AssignButton />
    </form>
  );
}

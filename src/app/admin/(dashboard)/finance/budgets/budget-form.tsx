"use client";

import { useRef, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { monthRange, toDateInput } from "@/lib/finance";
import { createBudget } from "../actions";

export function BudgetForm() {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { start, end } = monthRange();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createBudget(formData);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Budget created");
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="budget-name">Name</Label>
        <Input id="budget-name" name="name" placeholder="e.g. Q4 2026 Operating Budget" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="periodStart">Period start</Label>
          <Input
            id="periodStart"
            name="periodStart"
            type="date"
            defaultValue={toDateInput(start)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="periodEnd">Period end</Label>
          <Input
            id="periodEnd"
            name="periodEnd"
            type="date"
            defaultValue={toDateInput(end)}
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="budget-note">Note (optional)</Label>
        <Input id="budget-note" name="note" placeholder="Anything worth remembering about this budget" />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" />
        {pending ? "Creating…" : "Create budget"}
      </Button>
    </form>
  );
}

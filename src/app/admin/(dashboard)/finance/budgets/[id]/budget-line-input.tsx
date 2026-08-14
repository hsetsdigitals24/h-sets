"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setBudgetLine } from "../../actions";

/**
 * Inline editor for a single budget line's planned amount. Saves on blur or
 * Enter; a tick button gives an explicit affordance. An empty value clears the
 * line (planned 0).
 */
export function BudgetLineInput({
  budgetId,
  categoryId,
  planned,
}: {
  budgetId: string;
  categoryId: string;
  planned: number;
}) {
  const initial = planned ? String(planned) : "";
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();

  function save() {
    if (value === saved) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("budgetId", budgetId);
      fd.set("categoryId", categoryId);
      fd.set("planned", value);
      const res = await setBudgetLine(fd);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        setValue(saved);
        return;
      }
      setSaved(value);
      toast.success("Plan updated");
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        inputMode="numeric"
        placeholder="0"
        disabled={pending}
        className="h-9 w-32 text-right"
        aria-label="Planned amount"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending || value === saved}
        onClick={save}
        aria-label="Save plan"
      >
        <Check className="size-4" />
      </Button>
    </div>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FINANCE_METHODS,
  KIND_LABELS,
  METHOD_LABELS,
  toDateInput,
  type FinanceKind,
} from "@/lib/finance";
import { createTransaction } from "../actions";

type CategoryOption = { id: string; name: string; kind: FinanceKind };

/**
 * Inline record-keeping form. The category dropdown is filtered to the selected
 * side (revenue vs expenditure) so an income entry can't be filed under an
 * expense category and vice versa.
 */
export function TransactionForm({ categories }: { categories: CategoryOption[] }) {
  const [kind, setKind] = useState<FinanceKind>("income");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const options = categories.filter((c) => c.kind === kind);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createTransaction(formData);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${KIND_LABELS[kind]} recorded`);
      formRef.current?.reset();
      setKind("income");
    });
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="kind">Type</Label>
          <Select
            id="kind"
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as FinanceKind)}
          >
            <option value="income">Revenue (money in)</option>
            <option value="expense">Expenditure (money out)</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount (₦)</Label>
          <Input
            id="amount"
            name="amount"
            inputMode="numeric"
            placeholder="e.g. 150000"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          placeholder={kind === "income" ? "e.g. Cohort 5 tuition — J. Doe" : "e.g. October office rent"}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="occurredAt">Date</Label>
          <Input
            id="occurredAt"
            name="occurredAt"
            type="date"
            defaultValue={toDateInput(new Date())}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="categoryId">Category</Label>
          <Select id="categoryId" name="categoryId" defaultValue="">
            <option value="">Uncategorised</option>
            {options.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="method">Method</Label>
          <Select id="method" name="method" defaultValue="">
            <option value="">—</option>
            {FINANCE_METHODS.map((m) => (
              <option key={m} value={m}>
                {METHOD_LABELS[m]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reference">Reference (optional)</Label>
          <Input id="reference" name="reference" placeholder="Receipt / invoice / gateway ref" />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        <Plus className="size-4" />
        {pending ? "Saving…" : `Record ${KIND_LABELS[kind].toLowerCase()}`}
      </Button>
    </form>
  );
}

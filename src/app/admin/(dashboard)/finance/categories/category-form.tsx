"use client";

import { useRef, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createCategory } from "../actions";

export function CategoryForm() {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await createCategory(formData);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Category added");
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-1.5">
        <label htmlFor="cat-name" className="text-sm font-medium">
          Name
        </label>
        <Input id="cat-name" name="name" placeholder="e.g. Tuition, Salaries" required />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="cat-kind" className="text-sm font-medium">
          Side
        </label>
        <Select id="cat-kind" name="kind" defaultValue="income" className="sm:w-44">
          <option value="income">Revenue</option>
          <option value="expense">Expenditure</option>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" />
        {pending ? "Adding…" : "Add"}
      </Button>
    </form>
  );
}

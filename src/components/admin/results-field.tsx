"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/admin/form-kit";

type Result = { metric: string; label: string };

const emptyRow: Result = { metric: "", label: "" };

export function ResultsField({ defaultValue = [] }: { defaultValue?: Result[] }) {
  const [rows, setRows] = useState<Result[]>(
    defaultValue.length ? defaultValue : [emptyRow]
  );

  function update(index: number, key: keyof Result, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  // Only keep rows where both fields are filled, matching the server schema.
  const cleaned = rows
    .map((r) => ({ metric: r.metric.trim(), label: r.label.trim() }))
    .filter((r) => r.metric && r.label);

  return (
    <Field label="Results" hint="Add one metric per row, e.g. metric “+60%”, label “online bookings”.">
      <input type="hidden" name="results" value={JSON.stringify(cleaned)} />
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            <Input
              aria-label={`Result ${i + 1} metric`}
              placeholder="+60%"
              className="w-32"
              value={row.metric}
              onChange={(e) => update(i, "metric", e.target.value)}
            />
            <Input
              aria-label={`Result ${i + 1} label`}
              placeholder="online bookings"
              className="flex-1"
              value={row.label}
              onChange={(e) => update(i, "label", e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove result ${i + 1}`}
              disabled={rows.length === 1}
              onClick={() => removeRow(i)}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addRow}>
        + Add result
      </Button>
    </Field>
  );
}

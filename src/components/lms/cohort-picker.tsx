"use client";

import { useRouter, usePathname } from "next/navigation";
import { Select } from "@/components/ui/select";

/** Navigates to `?cohort=<id>` when a cohort is chosen. Used across LMS admin pages. */
export function CohortPicker({
  cohorts,
  selected,
}: {
  cohorts: { id: string; label: string }[];
  selected?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select
      value={selected ?? ""}
      onChange={(e) => {
        const value = e.target.value;
        router.push(value ? `${pathname}?cohort=${value}` : pathname);
      }}
      className="min-w-[280px]"
      aria-label="Select cohort"
    >
      <option value="">Select a cohort…</option>
      {cohorts.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label}
        </option>
      ))}
    </Select>
  );
}

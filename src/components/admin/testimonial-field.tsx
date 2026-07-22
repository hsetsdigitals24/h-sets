"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/admin/form-kit";

type Testimonial = { quote: string; name: string; role: string };

const empty: Testimonial = { quote: "", name: "", role: "" };

export function TestimonialField({ defaultValue }: { defaultValue?: Testimonial | null }) {
  const [value, setValue] = useState<Testimonial>(defaultValue ?? empty);

  function update(key: keyof Testimonial, next: string) {
    setValue((prev) => ({ ...prev, [key]: next }));
  }

  // Trim, and store null (empty hidden value) when nothing is filled in.
  const trimmed = { quote: value.quote.trim(), name: value.name.trim(), role: value.role.trim() };
  const hasAny = Boolean(trimmed.quote || trimmed.name || trimmed.role);

  return (
    <Field label="Testimonial" hint="Optional. Leave all fields blank for no testimonial.">
      <input type="hidden" name="testimonial" value={hasAny ? JSON.stringify(trimmed) : ""} />
      <div className="space-y-2">
        <Textarea
          aria-label="Testimonial quote"
          placeholder="Working with H-SETS transformed our operations…"
          rows={3}
          value={value.quote}
          onChange={(e) => update("quote", e.target.value)}
        />
        <div className="flex gap-2">
          <Input
            aria-label="Testimonial name"
            placeholder="Adaeze O."
            className="flex-1"
            value={value.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <Input
            aria-label="Testimonial role"
            placeholder="CEO, HealthCo"
            className="flex-1"
            value={value.role}
            onChange={(e) => update("role", e.target.value)}
          />
        </div>
      </div>
    </Field>
  );
}

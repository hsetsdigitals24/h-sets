"use client";

import { useState } from "react";
import type { Programme } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Field, PublishedField } from "@/components/admin/form-kit";
import { ICON_NAMES } from "@/lib/icon-map";
import { arrayToLines } from "@/lib/content-forms";

const PROGRAMME_LEVELS = [
  "Foundational",
  "Foundational–Intermediate",
  "Intermediate",
  "Intermediate–Advanced",
  "Advanced",
];

const PROGRAMME_CATEGORIES = ["Engineering", "Design", "AI & Data", "Business"];

type WeekRow = { week: string; title: string; topics: string };

function toWeekRows(value: unknown): WeekRow[] {
  if (!Array.isArray(value)) return [];
  return value.map((w) => {
    const item = (w ?? {}) as { week?: unknown; title?: unknown; topics?: unknown };
    return {
      week: item.week == null ? "" : String(item.week),
      title: item.title == null ? "" : String(item.title),
      topics: Array.isArray(item.topics) ? item.topics.map(String).join("\n") : "",
    };
  });
}

/** Structured, non-code editor for the week-by-week curriculum. */
function CurriculumField({ defaultValue }: { defaultValue: unknown }) {
  const [rows, setRows] = useState<WeekRow[]>(() => {
    const parsed = toWeekRows(defaultValue);
    return parsed.length ? parsed : [{ week: "1", title: "", topics: "" }];
  });

  const serialized = JSON.stringify(
    rows
      .map((r) => ({
        week: r.week.trim(),
        title: r.title.trim(),
        topics: r.topics
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
      }))
      .filter((r) => r.week || r.title || r.topics.length > 0)
  );

  const update = (index: number, patch: Partial<WeekRow>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const addWeek = () =>
    setRows((prev) => [...prev, { week: String(prev.length + 1), title: "", topics: "" }]);
  const removeWeek = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <Label>Curriculum</Label>
      <input type="hidden" name="curriculum" value={serialized} />
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-24 shrink-0 space-y-1.5">
                <Label htmlFor={`week-${i}`} className="text-xs text-muted-foreground">
                  Week
                </Label>
                <Input
                  id={`week-${i}`}
                  value={row.week}
                  onChange={(e) => update(i, { week: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`title-${i}`} className="text-xs text-muted-foreground">
                  Module title
                </Label>
                <Input
                  id={`title-${i}`}
                  value={row.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  placeholder="Foundations of Web Development"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-6 text-muted-foreground"
                onClick={() => removeWeek(i)}
                disabled={rows.length === 1}
                aria-label={`Remove week ${i + 1}`}
              >
                Remove
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`topics-${i}`} className="text-xs text-muted-foreground">
                Topics — one per line
              </Label>
              <Textarea
                id={`topics-${i}`}
                rows={3}
                value={row.topics}
                onChange={(e) => update(i, { topics: e.target.value })}
                placeholder={"HTML & semantics\nCSS layout\nResponsive design"}
              />
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addWeek}>
        Add week
      </Button>
    </div>
  );
}

type FaqRow = { q: string; a: string };

function toFaqRows(value: unknown): FaqRow[] {
  if (!Array.isArray(value)) return [];
  return value.map((f) => {
    const item = (f ?? {}) as { q?: unknown; a?: unknown };
    return {
      q: item.q == null ? "" : String(item.q),
      a: item.a == null ? "" : String(item.a),
    };
  });
}

/** Structured, non-code editor for the FAQ list. */
function FaqsField({ defaultValue }: { defaultValue: unknown }) {
  const [rows, setRows] = useState<FaqRow[]>(() => {
    const parsed = toFaqRows(defaultValue);
    return parsed.length ? parsed : [{ q: "", a: "" }];
  });

  const serialized = JSON.stringify(
    rows
      .map((r) => ({ q: r.q.trim(), a: r.a.trim() }))
      .filter((r) => r.q || r.a)
  );

  const update = (index: number, patch: Partial<FaqRow>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const addFaq = () => setRows((prev) => [...prev, { q: "", a: "" }]);
  const removeFaq = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <Label>FAQs</Label>
      <input type="hidden" name="faqs" value={serialized} />
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor={`faq-q-${i}`} className="text-xs text-muted-foreground">
                  Question
                </Label>
                <Input
                  id={`faq-q-${i}`}
                  value={row.q}
                  onChange={(e) => update(i, { q: e.target.value })}
                  placeholder="Do I need prior experience?"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-6 text-muted-foreground"
                onClick={() => removeFaq(i)}
                disabled={rows.length === 1}
                aria-label={`Remove FAQ ${i + 1}`}
              >
                Remove
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`faq-a-${i}`} className="text-xs text-muted-foreground">
                Answer
              </Label>
              <Textarea
                id={`faq-a-${i}`}
                rows={3}
                value={row.a}
                onChange={(e) => update(i, { a: e.target.value })}
                placeholder="No prior experience is required — we start from the fundamentals."
              />
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addFaq}>
        Add FAQ
      </Button>
    </div>
  );
}

export type InstructorOption = { id: string; name: string; title: string };

/**
 * The full set of programme input fields, without a surrounding <form> or
 * submit button — so it can be embedded inside the cohort form.
 */
export function ProgrammeFields({
  programme,
  instructors,
}: {
  programme?: Programme;
  instructors: InstructorOption[];
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={programme?.name} required />
        </Field>
        <Field label="Slug" htmlFor="slug" hint="Blank = from name">
          <Input id="slug" name="slug" defaultValue={programme?.slug} />
        </Field>
        <Field label="Icon" htmlFor="icon">
          <Select id="icon" name="icon" defaultValue={programme?.icon ?? "Code2"}>
            {ICON_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Level" htmlFor="level">
          <Select id="level" name="level" defaultValue={programme?.level ?? "Intermediate"} required>
            {PROGRAMME_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Category" htmlFor="category">
          <Select id="category" name="category" defaultValue={programme?.category ?? "Engineering"} required>
            {PROGRAMME_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Duration (weeks)" htmlFor="durationWeeks">
          <Input id="durationWeeks" name="durationWeeks" type="number" min={1} max={104} defaultValue={programme?.durationWeeks ?? 12} required />
        </Field>
        <Field label="Full fee (NGN)" htmlFor="feeFull">
          <Input id="feeFull" name="feeFull" type="number" min={0} defaultValue={programme?.feeFull ?? 0} required />
        </Field>
        <Field label="Installment fee (NGN)" htmlFor="feeInstallment">
          <Input id="feeInstallment" name="feeInstallment" type="number" min={0} defaultValue={programme?.feeInstallment ?? 0} required />
        </Field>
        <Field label="Sort order" htmlFor="sortOrder">
          <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={programme?.sortOrder ?? 0} />
        </Field>
      </div>

      <Field label="Short description" htmlFor="short">
        <Textarea id="short" name="short" rows={2} defaultValue={programme?.short} required />
      </Field>
      <Field label="Overview" htmlFor="overview">
        <Textarea id="overview" name="overview" rows={4} defaultValue={programme?.overview} required />
      </Field>

      <Field label="Outcomes" htmlFor="outcomes" hint="One per line.">
        <Textarea id="outcomes" name="outcomes" rows={5} defaultValue={arrayToLines(programme?.outcomes)} />
      </Field>
      <Field label="Tools" htmlFor="tools" hint="One per line.">
        <Textarea id="tools" name="tools" rows={3} defaultValue={arrayToLines(programme?.tools)} />
      </Field>

      <CurriculumField defaultValue={programme?.curriculum ?? []} />
      <Field label="Instructor" htmlFor="instructorId" hint="Manage the list under Instructors.">
        <Select
          id="instructorId"
          name="instructorId"
          defaultValue={programme?.instructorId ?? ""}
          required
        >
          <option value="" disabled>
            Select an instructor…
          </option>
          {instructors.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} — {i.title}
            </option>
          ))}
        </Select>
      </Field>
      <FaqsField defaultValue={programme?.faqs ?? []} />

      <PublishedField defaultChecked={programme?.published ?? true} />
    </div>
  );
}

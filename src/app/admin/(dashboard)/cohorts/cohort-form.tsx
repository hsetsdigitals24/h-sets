"use client";

import { useActionState, useState } from "react";
import type { Cohort, Programme } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import { ProgrammeFields, type InstructorOption } from "@/components/admin/programme-fields";
import type { ContentActionState } from "@/lib/content-forms";

const FORMATS = ["Full-time", "Part-time", "Weekend"];
const STATUSES = ["Open", "Filling Fast", "Full", "Waitlist"];

type Action = (prev: ContentActionState, fd: FormData) => Promise<ContentActionState>;
type ProgrammeOption = { id: string; name: string };
type CohortWithRelations = Cohort & {
  instructors: { id: string }[];
  programme: Programme;
};

export function CohortForm({
  action,
  cohort,
  programmes,
  instructors,
}: {
  action: Action;
  cohort?: CohortWithRelations;
  programmes: ProgrammeOption[];
  instructors: InstructorOption[];
}) {
  const [state, formAction] = useActionState<ContentActionState, FormData>(action, {});
  const selected = new Set(cohort?.instructors.map((i) => i.id) ?? []);
  // In edit mode the linked programme is always edited inline. In create mode
  // the admin chooses between reusing an existing programme or creating a new one.
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const editing = Boolean(cohort);
  const showProgrammeFields = editing || mode === "new";

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {cohort && <input type="hidden" name="id" value={cohort.id} />}
      {!editing && <input type="hidden" name="programmeMode" value={mode} />}

      <fieldset className="space-y-5 rounded-2xl border border-border p-5">
        <legend className="px-1 text-sm font-semibold">Programme</legend>

        {!editing && (
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="programmeModeToggle"
                value="existing"
                checked={mode === "existing"}
                onChange={() => setMode("existing")}
                className="size-4"
              />
              Use existing programme
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="programmeModeToggle"
                value="new"
                checked={mode === "new"}
                onChange={() => setMode("new")}
                className="size-4"
              />
              Create new programme
            </label>
          </div>
        )}

        {!editing && mode === "existing" && (
          <Field label="Programme" htmlFor="programmeId">
            <Select id="programmeId" name="programmeId" defaultValue={cohort?.programmeId} required>
              <option value="" disabled>
                Select a programme…
              </option>
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {showProgrammeFields && (
          <ProgrammeFields programme={cohort?.programme} instructors={instructors} />
        )}
      </fieldset>

      <fieldset className="space-y-5 rounded-2xl border border-border p-5">
        <legend className="px-1 text-sm font-semibold">Cohort</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Start date" htmlFor="startDate">
            <Input id="startDate" name="startDate" type="date" defaultValue={cohort?.startDate} required />
          </Field>
          <Field label="End date" htmlFor="endDate">
            <Input id="endDate" name="endDate" type="date" defaultValue={cohort?.endDate} required />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Format" htmlFor="format">
            <Select id="format" name="format" defaultValue={cohort?.format ?? "Full-time"}>
              {FORMATS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Seats total" htmlFor="seatsTotal">
            <Input
              id="seatsTotal"
              name="seatsTotal"
              type="number"
              min={1}
              defaultValue={cohort ? String(cohort.seatsTotal) : "30"}
              required
            />
          </Field>
          <Field label="Seats left" htmlFor="seatsLeft">
            <Input
              id="seatsLeft"
              name="seatsLeft"
              type="number"
              min={0}
              defaultValue={cohort ? String(cohort.seatsLeft) : "30"}
              required
            />
          </Field>
        </div>

        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={cohort?.status ?? "Open"}>
            {STATUSES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Instructors">
          {instructors.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">No instructors yet.</p>
          ) : (
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-xl border border-input bg-background px-3 py-2">
              {instructors.map((i) => (
                <label key={i.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="instructorIds"
                    value={i.id}
                    defaultChecked={selected.has(i.id)}
                    className="size-4 rounded border-input"
                  />
                  <span className="truncate">
                    {i.name} — {i.title}
                  </span>
                </label>
              ))}
            </div>
          )}
        </Field>
      </fieldset>

      <FormError error={state.error} />
      <SubmitButton>{cohort ? "Save changes" : "Create cohort"}</SubmitButton>
    </form>
  );
}

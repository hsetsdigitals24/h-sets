"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Field, SubmitButton, FormError } from "@/components/admin/form-kit";
import type { ContentActionState } from "@/lib/content-forms";
import { DeleteButton } from "@/components/admin/delete-button";
import { createExam, updateExam, updateExamIntegrity, addQuestion, updateQuestion, deleteQuestion, reviewExam, setExamRetakeGrant, forceExamRetake } from "./actions";

type IntegrityValues = {
  questionsToServe: number | null;
  shuffleOptions: boolean;
  requireAttestation: boolean;
  attestationText: string;
  requireFullscreen: boolean;
  trackFocus: boolean;
  restrictCopyPaste: boolean;
  maxViolations: number;
};

type QuestionValues = {
  type: "mcq" | "true_false";
  marks: number;
  text: string;
  options: string[];
  correctIndex: number;
  correctBool: boolean;
};

type McqOption = { id: string; text: string };

type ExamValues = {
  title: string;
  instructions: string;
  durationMins: number;
  passMark: number;
  maxAttempts: number;
  cooldownMins: number;
  retakeOnFail: boolean;
  shuffle: boolean;
  questionsToServe: number | null;
  shuffleOptions: boolean;
  requireAttestation: boolean;
  attestationText: string;
  requireFullscreen: boolean;
  trackFocus: boolean;
  restrictCopyPaste: boolean;
  maxViolations: number;
};

/** A Yes/No select bound to a hidden-input-friendly string value. */
function YesNoField({
  label,
  name,
  hint,
  defaultValue,
}: {
  label: string;
  name: string;
  hint?: string;
  defaultValue?: boolean;
}) {
  const [on, setOn] = useState(defaultValue ?? false);
  return (
    <Field label={label} htmlFor={name} hint={hint}>
      <Select id={name} name={name} value={on ? "true" : "false"} onChange={(e) => setOn(e.target.value === "true")}>
        <option value="false">No</option>
        <option value="true">Yes</option>
      </Select>
    </Field>
  );
}

/** The integrity control inputs, shared by the full exam form and the standalone editor. */
function IntegrityFields({ defaults }: { defaults?: Partial<IntegrityValues> }) {
  return (
    <>
      <Field
        label="Questions to serve"
        htmlFor="questionsToServe"
        hint="Serve a random subset of this size per student. 0 or blank = serve all questions."
      >
        <Input
          id="questionsToServe"
          name="questionsToServe"
          type="number"
          min={0}
          max={500}
          defaultValue={defaults?.questionsToServe ?? 0}
        />
      </Field>
      <YesNoField
        label="Shuffle answer options"
        name="shuffleOptions"
        hint="Randomise MCQ option order per student."
        defaultValue={defaults?.shuffleOptions}
      />
      <YesNoField
        label="Require attestation"
        name="requireAttestation"
        hint="Show an honour pledge the student must accept before starting."
        defaultValue={defaults?.requireAttestation}
      />
      <YesNoField
        label="Track focus"
        name="trackFocus"
        hint="Flag tab-switches and window blur."
        defaultValue={defaults?.trackFocus}
      />
      <YesNoField
        label="Require fullscreen"
        name="requireFullscreen"
        hint="Enter fullscreen and flag exits (where supported)."
        defaultValue={defaults?.requireFullscreen}
      />
      <YesNoField
        label="Restrict copy / paste"
        name="restrictCopyPaste"
        hint="Block and flag copy, paste and right-click."
        defaultValue={defaults?.restrictCopyPaste}
      />
      <Field
        label="Auto-submit after N flags"
        htmlFor="maxViolations"
        hint="Warn, then auto-submit once this many integrity flags occur. 0 = never auto-submit."
      >
        <Input
          id="maxViolations"
          name="maxViolations"
          type="number"
          min={0}
          max={50}
          defaultValue={defaults?.maxViolations ?? 0}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field
          label="Attestation text"
          htmlFor="attestationText"
          hint="Optional. Shown when 'Require attestation' is on. Leave blank for the default pledge."
        >
          <Textarea id="attestationText" name="attestationText" rows={3} defaultValue={defaults?.attestationText} />
        </Field>
      </div>
    </>
  );
}

/** Shared exam metadata fields, used by both create and edit forms. */
function ExamFields({ defaults }: { defaults?: Partial<ExamValues> }) {
  const [shuffle, setShuffle] = useState(defaults?.shuffle ?? false);
  const [retakeOnFail, setRetakeOnFail] = useState(defaults?.retakeOnFail ?? false);
  return (
    <>
      <div className="sm:col-span-2">
        <Field label="Title" htmlFor="title">
          <Input id="title" name="title" defaultValue={defaults?.title} required />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Instructions" htmlFor="instructions" hint="Shown to students before they start.">
          <Textarea id="instructions" name="instructions" rows={3} defaultValue={defaults?.instructions} />
        </Field>
      </div>
      <Field label="Duration (minutes)" htmlFor="durationMins">
        <Input id="durationMins" name="durationMins" type="number" min={1} max={600} defaultValue={defaults?.durationMins ?? 60} required />
      </Field>
      <Field label="Pass mark (%)" htmlFor="passMark">
        <Input id="passMark" name="passMark" type="number" min={0} max={100} defaultValue={defaults?.passMark ?? 50} required />
      </Field>
      <Field label="Max attempts" htmlFor="maxAttempts">
        <Input id="maxAttempts" name="maxAttempts" type="number" min={1} max={10} defaultValue={defaults?.maxAttempts ?? 1} required />
      </Field>
      <Field label="Cooldown (minutes)" htmlFor="cooldownMins" hint="Minimum wait between attempts. 0 = none.">
        <Input id="cooldownMins" name="cooldownMins" type="number" min={0} max={10080} defaultValue={defaults?.cooldownMins ?? 0} required />
      </Field>
      <Field label="Retake only after fail" htmlFor="retakeOnFail" hint="Block further attempts once the student has passed.">
        <Select
          id="retakeOnFail"
          name="retakeOnFail"
          value={retakeOnFail ? "true" : "false"}
          onChange={(e) => setRetakeOnFail(e.target.value === "true")}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </Select>
      </Field>
      <Field label="Shuffle questions" htmlFor="shuffle">
        <Select
          id="shuffle"
          name="shuffle"
          value={shuffle ? "true" : "false"}
          onChange={(e) => setShuffle(e.target.value === "true")}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </Select>
      </Field>

      {/* --- Integrity controls --- */}
      <div className="sm:col-span-2 mt-2 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">Integrity</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Anti-cheating controls applied while students take this exam.
        </p>
      </div>
      <IntegrityFields defaults={defaults} />
    </>
  );
}

export function CreateExamForm({ cohortId }: { cohortId: string }) {
  const [state, action] = useActionState<ContentActionState, FormData>(createExam, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Exam created");
      ref.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={ref} action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="cohortId" value={cohortId} />
      <ExamFields />
      <div className="sm:col-span-2 space-y-3">
        <FormError error={state.error} />
        <SubmitButton>Create exam</SubmitButton>
      </div>
    </form>
  );
}

export function EditExamForm({ examId, defaults }: { examId: string; defaults: ExamValues }) {
  const [state, action] = useActionState<ContentActionState, FormData>(updateExam, {});

  useEffect(() => {
    if (state.ok) toast.success("Exam updated");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="examId" value={examId} />
      <ExamFields defaults={defaults} />
      <div className="sm:col-span-2 space-y-3">
        <FormError error={state.error} />
        <SubmitButton>Save changes</SubmitButton>
      </div>
    </form>
  );
}

/**
 * Integrity-only editor, usable even when the exam is scheduled/live (the full
 * {@link EditExamForm} is hidden then). Subset/shuffle changes apply to future
 * attempts only; behavioral flags take effect on the next event/attempt.
 */
export function EditExamIntegrityForm({
  examId,
  defaults,
}: {
  examId: string;
  defaults: IntegrityValues;
}) {
  const [state, action] = useActionState<ContentActionState, FormData>(updateExamIntegrity, {});

  useEffect(() => {
    if (state.ok) toast.success("Integrity settings saved");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="examId" value={examId} />
      <p className="sm:col-span-2 text-xs text-muted-foreground">
        Changes to the served subset and option shuffle apply to attempts started after saving;
        attempts already in progress keep the paper they were given.
      </p>
      <IntegrityFields defaults={defaults} />
      <div className="sm:col-span-2 space-y-3">
        <FormError error={state.error} />
        <SubmitButton>Save integrity settings</SubmitButton>
      </div>
    </form>
  );
}

const OPTION_ROWS = [0, 1, 2, 3];

/** Shared question input fields, used by both add and edit forms. */
function QuestionFields({ defaults }: { defaults?: Partial<QuestionValues> }) {
  const [type, setType] = useState<"mcq" | "true_false">(defaults?.type ?? "mcq");
  const [correctIndex, setCorrectIndex] = useState(defaults?.correctIndex ?? 0);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Type" htmlFor="type">
          <Select id="type" name="type" value={type} onChange={(e) => setType(e.target.value as "mcq" | "true_false")}>
            <option value="mcq">Multiple choice</option>
            <option value="true_false">True / False</option>
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Marks" htmlFor="marks">
            <Input id="marks" name="marks" type="number" min={1} max={100} defaultValue={defaults?.marks ?? 1} required />
          </Field>
        </div>
      </div>

      <Field label="Question" htmlFor="text">
        <Textarea id="text" name="text" rows={2} defaultValue={defaults?.text} required />
      </Field>

      {type === "mcq" ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Options (select the correct one)</legend>
          {OPTION_ROWS.map((i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="radio"
                name="correctIndex"
                value={i}
                checked={correctIndex === i}
                onChange={() => setCorrectIndex(i)}
                aria-label={`Option ${i + 1} is correct`}
              />
              <Input
                name="options"
                defaultValue={defaults?.options?.[i]}
                placeholder={`Option ${i + 1}${i < 2 ? " (required)" : " (optional)"}`}
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Leave optional rows blank to use fewer options.</p>
        </fieldset>
      ) : (
        <Field label="Correct answer" htmlFor="correctBool">
          <Select id="correctBool" name="correctBool" defaultValue={defaults?.correctBool ? "true" : "false"}>
            <option value="true">True</option>
            <option value="false">False</option>
          </Select>
        </Field>
      )}
    </>
  );
}

export function AddQuestionForm({ examId }: { examId: string }) {
  const [state, action] = useActionState<ContentActionState, FormData>(addQuestion, {});
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Question added");
      ref.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={ref} action={action} className="space-y-4">
      <input type="hidden" name="examId" value={examId} />
      <QuestionFields />
      <FormError error={state.error} />
      <SubmitButton>Add question</SubmitButton>
    </form>
  );
}

function EditQuestionForm({
  questionId,
  defaults,
  onSaved,
}: {
  questionId: string;
  defaults: QuestionValues;
  onSaved: () => void;
}) {
  const [state, action] = useActionState<ContentActionState, FormData>(updateQuestion, {});

  useEffect(() => {
    if (state.ok) {
      toast.success("Question updated");
      onSaved();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSaved]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="questionId" value={questionId} />
      <QuestionFields defaults={defaults} />
      <FormError error={state.error} />
      <div className="flex gap-2">
        <SubmitButton>Save changes</SubmitButton>
        <Button type="button" variant="outline" onClick={onSaved}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

type QuestionItemData = {
  id: string;
  type: string;
  text: string;
  marks: number;
  options: McqOption[];
  correct: unknown;
};

/** One question row: read-only view with edit/delete controls when editable. */
export function QuestionItem({
  index,
  question,
  editable,
}: {
  index: number;
  question: QuestionItemData;
  editable: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const options = question.options ?? [];
  const correctIndex = Math.max(
    0,
    options.findIndex((o) => o.id === String(question.correct))
  );

  return (
    <li className="rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm">
          <span className="font-medium">
            {index + 1}. {question.text}
          </span>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {question.type === "mcq" ? "Multiple choice" : "True / False"} · {question.marks} mark(s)
          </div>
        </div>
        {editable && !editing && (
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <DeleteButton id={question.id} action={deleteQuestion} confirmText="Delete this question?" />
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-4 border-t border-border pt-4">
          <EditQuestionForm
            questionId={question.id}
            defaults={{
              type: question.type === "true_false" ? "true_false" : "mcq",
              marks: question.marks,
              text: question.text,
              options: options.map((o) => o.text),
              correctIndex,
              correctBool: Boolean(question.correct),
            }}
            onSaved={() => setEditing(false)}
          />
        </div>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {question.type === "mcq" ? (
            options.map((o) => (
              <li key={o.id} className={String(question.correct) === o.id ? "text-emerald-700" : "text-muted-foreground"}>
                {String(question.correct) === o.id ? "✓ " : "• "}
                {o.text}
              </li>
            ))
          ) : (
            <li className="text-emerald-700">✓ {question.correct ? "True" : "False"}</li>
          )}
        </ul>
      )}
    </li>
  );
}

/**
 * Inline control to set the total bonus attempts for one student on an exam.
 * `extra = 0` clears the grant.
 */
export function RetakeGrantForm({
  examId,
  studentId,
  defaultExtra,
}: {
  examId: string;
  studentId: string;
  defaultExtra: number;
}) {
  const [pending, startTransition] = useTransition();
  const [extra, setExtra] = useState(defaultExtra);
  const [reason, setReason] = useState("");

  function save() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("examId", examId);
      fd.set("studentId", studentId);
      fd.set("extraAttempts", String(extra));
      fd.set("reason", reason);
      const res = await setExamRetakeGrant(fd);
      if (res && "error" in res && res.error) toast.error(res.error);
      else toast.success("Retake grant saved");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        type="number"
        min={0}
        max={10}
        value={extra}
        onChange={(e) => setExtra(Math.max(0, Number(e.target.value)))}
        className="w-20"
        aria-label="Extra attempts"
      />
      <Input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="w-48"
        aria-label="Reason"
      />
      <Button type="button" size="sm" variant="outline" disabled={pending} onClick={save}>
        Save
      </Button>
    </div>
  );
}

/** Render a Date/ISO string as a `datetime-local` input value in local time. */
function toLocalInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Admin-only control to make one student repeat an exam and reopen it for them
 * on a custom window (leaving the cohort schedule untouched). Superset of
 * {@link RetakeGrantForm}: bonus attempts + a personal open/close window. Clear
 * both dates and Save to remove the override.
 */
export function ForceRetakeForm({
  examId,
  studentId,
  defaultExtra,
  defaultOpenFrom,
  defaultOpenUntil,
}: {
  examId: string;
  studentId: string;
  defaultExtra: number;
  defaultOpenFrom?: string | null;
  defaultOpenUntil?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [extra, setExtra] = useState(defaultExtra);
  const [openFrom, setOpenFrom] = useState(toLocalInput(defaultOpenFrom));
  const [openUntil, setOpenUntil] = useState(toLocalInput(defaultOpenUntil));
  const [reason, setReason] = useState("");

  function save() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("examId", examId);
      fd.set("studentId", studentId);
      fd.set("extraAttempts", String(extra));
      fd.set("openFrom", openFrom);
      fd.set("openUntil", openUntil);
      fd.set("reason", reason);
      const res = await forceExamRetake(fd);
      if (res && "error" in res && res.error) toast.error(res.error);
      else toast.success("Retake saved");
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-muted-foreground">
          Extra attempts
          <Input
            type="number"
            min={0}
            max={10}
            value={extra}
            onChange={(e) => setExtra(Math.max(0, Number(e.target.value)))}
            className="mt-1 w-20"
            aria-label="Extra attempts"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Open from
          <Input
            type="datetime-local"
            value={openFrom}
            onChange={(e) => setOpenFrom(e.target.value)}
            className="mt-1 w-52"
            aria-label="Open from"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Open until
          <Input
            type="datetime-local"
            value={openUntil}
            onChange={(e) => setOpenUntil(e.target.value)}
            className="mt-1 w-52"
            aria-label="Open until"
          />
        </label>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:justify-end">
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="w-48"
          aria-label="Reason"
        />
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={save}>
          Save
        </Button>
      </div>
    </div>
  );
}

export function ReviewExamForm({ examId }: { examId: string }) {
  const [state, action] = useActionState<ContentActionState, FormData>(reviewExam, {});
  const [decision, setDecision] = useState<"approve" | "reject">("approve");

  useEffect(() => {
    if (state.ok) toast.success("Exam reviewed");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="examId" value={examId} />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={decision === "approve" ? "gradient" : "outline"}
          onClick={() => setDecision("approve")}
        >
          Approve & schedule
        </Button>
        <Button
          type="button"
          size="sm"
          variant={decision === "reject" ? "default" : "outline"}
          onClick={() => setDecision("reject")}
        >
          Reject
        </Button>
      </div>
      <input type="hidden" name="decision" value={decision} />

      {decision === "approve" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Opens at" htmlFor="startAt">
            <Input id="startAt" name="startAt" type="datetime-local" required />
          </Field>
          <Field label="Closes at" htmlFor="endAt">
            <Input id="endAt" name="endAt" type="datetime-local" required />
          </Field>
        </div>
      ) : (
        <Field label="Reason / what to fix" htmlFor="reviewNote">
          <Textarea id="reviewNote" name="reviewNote" rows={3} required />
        </Field>
      )}

      <FormError error={state.error} />
      <SubmitButton>{decision === "approve" ? "Schedule exam" : "Send back to instructor"}</SubmitButton>
    </form>
  );
}

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarCheck, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { z } from "zod";
import { submitForm } from "@/lib/api";
import { consultationSchema } from "@/lib/schemas";
import { Field } from "./field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sessions = [
  { id: "discovery", label: "Discovery Call", mins: 30, desc: "Initial chat about your business needs." },
  { id: "strategy", label: "Strategy Session", mins: 60, desc: "Deep-dive for qualified projects." },
  { id: "ai", label: "AI Consultation", mins: 45, desc: "AI readiness and automation scoping." },
  { id: "academy", label: "Academy Guidance", mins: 20, desc: "Questions before enrolling in a cohort." },
];

const slots = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

function nextDays(count: number) {
  const out: { iso: string; day: string; date: string }[] = [];
  const d = new Date();
  let added = 0;
  while (added < count) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue; // weekdays only
    out.push({
      iso: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString("en-GB", { weekday: "short" }),
      date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    });
    added += 1;
  }
  return out;
}

// The booking widget manages session/day/slot itself; react-hook-form only
// validates the user-detail fields, reusing the shared schema.
const detailsSchema = consultationSchema.pick({
  name: true,
  email: true,
  phone: true,
  company: true,
  notes: true,
});
type Values = z.infer<typeof detailsSchema>;

export function ConsultationForm() {
  const days = React.useMemo(() => nextDays(5), []);
  const [session, setSession] = React.useState(sessions[0].id);
  const [day, setDay] = React.useState(days[0].iso);
  const [slot, setSlot] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(detailsSchema) });

  async function onSubmit(values: Values) {
    if (!slot) {
      toast.error("Please pick a time slot");
      return;
    }
    try {
      await submitForm("consultation", { ...values, session, day, slot });
      toast.success("Consultation booked!", {
        description: "A calendar invite is on its way to your inbox.",
      });
      setDone(true);
    } catch (err) {
      toast.error("Couldn't book your consultation", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  if (done) {
    const chosen = sessions.find((s) => s.id === session)!;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary/50 p-10 text-center"
      >
        <CheckCircle2 className="size-12 text-emerald-500" />
        <h3 className="text-xl font-semibold">You&apos;re booked in!</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your <strong>{chosen.label}</strong> is set for{" "}
          <strong>
            {new Date(day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </strong>{" "}
          at <strong>{slot}</strong>. Check your email for the calendar invite.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Session type */}
      <div>
        <p className="mb-3 text-sm font-semibold">1. Choose a session</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {sessions.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setSession(s.id)}
              className={cn(
                "flex flex-col rounded-xl border p-4 text-left transition-all",
                session === s.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="flex items-center justify-between">
                <span className="font-medium">{s.label}</span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" /> {s.mins}m
                </span>
              </span>
              <span className="mt-1 text-xs text-muted-foreground">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <p className="mb-3 text-sm font-semibold">2. Pick a day</p>
        <div className="flex flex-wrap gap-2">
          {days.map((d) => (
            <button
              type="button"
              key={d.iso}
              onClick={() => {
                setDay(d.iso);
                setSlot(null);
              }}
              className={cn(
                "flex min-w-[72px] flex-col items-center rounded-xl border px-3 py-2 text-center transition-all",
                day === d.iso
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-xs uppercase opacity-80">{d.day}</span>
              <span className="text-sm font-semibold">{d.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Time slot */}
      <div>
        <p className="mb-3 text-sm font-semibold">3. Pick a time</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {slots.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setSlot(t)}
              className={cn(
                "rounded-xl border py-2 text-sm font-medium transition-all",
                slot === t
                  ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div>
        <p className="mb-3 text-sm font-semibold">4. Your details</p>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="c-name" required error={errors.name?.message}>
              <Input id="c-name" placeholder="Ada Lovelace" {...register("name")} />
            </Field>
            <Field label="Email" htmlFor="c-email" required error={errors.email?.message}>
              <Input id="c-email" type="email" placeholder="you@company.com" {...register("email")} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" htmlFor="c-phone" required error={errors.phone?.message}>
              <Input id="c-phone" placeholder="+234…" {...register("phone")} />
            </Field>
            <Field label="Company" htmlFor="c-company">
              <Input id="c-company" placeholder="Optional" {...register("company")} />
            </Field>
          </div>
          <Field label="What would you like to discuss?" htmlFor="c-notes">
            <Textarea id="c-notes" rows={3} placeholder="Optional — a sentence or two helps us prepare." {...register("notes")} />
          </Field>
        </div>
      </div>

      <Button type="submit" variant="gradient" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <CalendarCheck className="size-4" />}
        Confirm booking
      </Button>
    </form>
  );
}

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { submitForm } from "@/lib/api";
import { contactSchema, type ContactInput } from "@/lib/schemas";
import { Field } from "./field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import * as React from "react";

type Values = ContactInput;

const topics = [
  "General enquiry",
  "Business services",
  "AI solutions",
  "Academy / training",
  "Corporate training",
  "Partnership",
];

export function ContactForm() {
  const [done, setDone] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: Values) {
    try {
      await submitForm("contact", values);
      toast.success("Message sent!", { description: "We'll reply within one business day." });
      setDone(true);
    } catch (err) {
      toast.error("Couldn't send your message", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary/50 p-10 text-center">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <h3 className="text-xl font-semibold">Thank you — message received</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          A member of our team will get back to you within one business day. For anything
          urgent, email us directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" required error={errors.name?.message}>
          <Input id="name" placeholder="Ada Lovelace" {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" htmlFor="company">
          <Input id="company" placeholder="Optional" {...register("company")} />
        </Field>
        <Field label="Topic" htmlFor="topic" required error={errors.topic?.message}>
          <select
            id="topic"
            {...register("topic")}
            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            defaultValue=""
          >
            <option value="" disabled>
              Select a topic
            </option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="How can we help?" htmlFor="message" required error={errors.message?.message}>
        <Textarea id="message" rows={5} placeholder="Tell us about your project, goals or questions…" {...register("message")} />
      </Field>
      <Button type="submit" variant="gradient" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send message
      </Button>
    </form>
  );
}

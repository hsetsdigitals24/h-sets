"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { submitForm } from "@/lib/api";
import { newsletterSchema, type NewsletterInput } from "@/lib/schemas";

type Values = NewsletterInput;

export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(newsletterSchema) });

  async function onSubmit(values: Values) {
    try {
      await submitForm("newsletter", values);
      toast.success("You're subscribed!", {
        description: "Watch your inbox for our next insight.",
      });
      reset();
    } catch (err) {
      toast.error("Something went wrong", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="you@company.com"
          aria-label="Email address"
          {...register("email")}
          className="h-11 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          aria-label="Subscribe"
          className="grid h-11 w-12 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
        </button>
      </div>
      {errors.email && (
        <p className="text-xs text-red-300">{errors.email.message}</p>
      )}
    </form>
  );
}

"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import { submitForm } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Field } from "./field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { gateFields, type Resource } from "@/data/resources";

const fieldMeta: Record<string, { label: string; type: string; placeholder: string }> = {
  name: { label: "Full name", type: "text", placeholder: "Ada Lovelace" },
  email: { label: "Work email", type: "email", placeholder: "you@company.com" },
  company: { label: "Company", type: "text", placeholder: "Company name" },
  role: { label: "Role", type: "text", placeholder: "e.g. Marketing Lead" },
  phone: { label: "Phone", type: "tel", placeholder: "+234…" },
};

export function ResourceGateModal({
  resource,
  open,
  onOpenChange,
}: {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [done, setDone] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, string>>();

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDone(false);
      reset();
    }
  }, [open, resource, reset]);

  if (!resource) return null;
  const fields = gateFields[resource.gate];

  async function onSubmit(values: Record<string, string>) {
    try {
      await submitForm("resource", {
        resourceId: resource!.id,
        resourceTitle: resource!.title,
        ...values,
      });
      toast.success("Sent to your inbox!", {
        description: "Your download link is on its way.",
      });
      setDone(true);
    } catch (err) {
      toast.error("Couldn't process your request", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="size-12 text-emerald-500" />
            <DialogTitle className="text-xl">Check your inbox</DialogTitle>
            <DialogDescription>
              We&apos;ve emailed your copy of <strong>{resource.title}</strong>. You can also
              download it now.
            </DialogDescription>
            <Button variant="gradient" className="mt-2" onClick={() => onOpenChange(false)}>
              <Download className="size-4" /> Download now
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {resource.type}
              </span>
              <DialogTitle>{resource.title}</DialogTitle>
              <DialogDescription>
                Enter your details and we&apos;ll send it straight to your inbox.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {fields.map((f) => {
                const meta = fieldMeta[f];
                return (
                  <Field
                    key={f}
                    label={meta.label}
                    htmlFor={`gate-${f}`}
                    required
                    error={errors[f]?.message as string | undefined}
                  >
                    <Input
                      id={`gate-${f}`}
                      type={meta.type}
                      placeholder={meta.placeholder}
                      {...register(f, {
                        required: `${meta.label} is required`,
                        ...(f === "email"
                          ? { pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: "Enter a valid email" } }
                          : {}),
                      })}
                    />
                  </Field>
                );
              })}
              <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Get my copy
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

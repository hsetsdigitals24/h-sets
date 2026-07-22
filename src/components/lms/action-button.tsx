"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = React.ComponentProps<typeof Button>["variant"];
type Size = React.ComponentProps<typeof Button>["size"];

/**
 * Submits a bound server action that may return `{ error }`. Use for one-click
 * mutations (mark complete, confirm attendance, issue certificate) where a plain
 * <form action> won't do because the action returns a value. Toasts on error.
 */
export function ActionButton({
  action,
  fields,
  children,
  variant = "outline",
  size = "sm",
  className,
  successMessage,
  confirm,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  fields: Record<string, string>;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  successMessage?: string;
  confirm?: string;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (confirm && !window.confirm(confirm)) return;
    startTransition(async () => {
      const fd = new FormData();
      for (const [k, v] of Object.entries(fields)) fd.set(k, v);
      const res = await action(fd);
      if (res && "error" in res && res.error) toast.error(res.error);
      else if (successMessage) toast.success(successMessage);
    });
  }

  return (
    <Button type="button" variant={variant} size={size} disabled={pending} onClick={onClick} className={cn(className)}>
      {children}
    </Button>
  );
}

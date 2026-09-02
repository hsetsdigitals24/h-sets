"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { StudentNavLinks } from "./nav-links";

/**
 * Hamburger button + slide-in drawer that surfaces the student navigation on
 * viewports too narrow for the persistent sidebar (below `md`). Closes on
 * navigation via {@link StudentNavLinks}'s `onNavigate`.
 */
export function StudentMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left md:hidden">
          <DialogPrimitive.Title className="sr-only">
            Student navigation
          </DialogPrimitive.Title>
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
            <span className="text-lg font-bold tracking-tight">
              H-SETS <span className="text-primary">Academy</span>
            </span>
            <DialogPrimitive.Close
              className="rounded-full p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>
          <StudentNavLinks onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

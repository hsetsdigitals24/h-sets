"use client";

import { useState, useTransition } from "react";
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import {
  ALL_SECTIONS,
  ALWAYS_ON_SECTION,
  type AdminSection,
} from "@/lib/rbac";
import { NAV_GROUPS, NAV_ITEMS } from "@/components/admin/nav";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateUserPermissions } from "./actions";

// Section slug -> { group, label } from the nav so the editor mirrors the
// sidebar. Every AdminSection has a nav entry; any that somehow don't fall back
// to the "Overview" group so they can still be toggled.
const META = new Map(
  NAV_ITEMS.map((i) => [i.section, { group: i.group, label: i.label }])
);

/**
 * Super-admin control for a single team member's page access. Opens a dialog of
 * grouped checkboxes (mirroring the sidebar). The checked set is the member's
 * authoritative allowlist — saving replaces any prior overrides. The dashboard
 * is always on and cannot be unchecked.
 */
export function PermissionsEditor({
  userId,
  userName,
  current,
}: {
  userId: string;
  userName: string;
  current: AdminSection[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<AdminSection>>(
    () => new Set(current)
  );
  const [pending, startTransition] = useTransition();

  function reset() {
    setSelected(new Set(current));
  }

  function toggle(section: AdminSection) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  function save() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", userId);
      for (const section of selected) {
        if (section !== ALWAYS_ON_SECTION) fd.append("section", section);
      }
      const res = await updateUserPermissions(fd);
      if (res && "error" in res && res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Access updated for ${userName}`);
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        <SlidersHorizontal className="size-4" />
        Access
      </Button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) reset();
          setOpen(o);
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Page access — {userName}</DialogTitle>
            <DialogDescription>
              Tick the pages this member can open. This replaces their
              role&rsquo;s defaults. The Overview dashboard is always available.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {NAV_GROUPS.map((group) => {
              const sections = ALL_SECTIONS.filter(
                (s) => (META.get(s)?.group ?? "Overview") === group
              );
              if (sections.length === 0) return null;
              return (
                <fieldset key={group} className="space-y-2">
                  <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </legend>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {sections.map((section) => {
                      const locked = section === ALWAYS_ON_SECTION;
                      const checked = locked || selected.has(section);
                      return (
                        <label
                          key={section}
                          className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5"
                        >
                          <input
                            type="checkbox"
                            className="size-4 accent-primary"
                            checked={checked}
                            disabled={locked || pending}
                            onChange={() => toggle(section)}
                          />
                          <span className={locked ? "text-muted-foreground" : ""}>
                            {META.get(section)?.label ?? section}
                            {locked && " (always on)"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={save} disabled={pending}>
              {pending ? "Saving…" : "Save access"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

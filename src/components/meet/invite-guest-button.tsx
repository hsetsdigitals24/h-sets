"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * "Invite guest" control for a meeting. Works for any room type: pass exactly
 * one of `company` / `projectId` / `sessionId`. Posts to /api/livekit/invite,
 * which authorizes the caller against that room and emails the guest a
 * login-free join link. Rendered only on staff surfaces (never the guest room).
 */
export function InviteGuestButton(props: {
  company?: string;
  projectId?: string;
  sessionId?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const { company, projectId, sessionId, variant = "outline", size = "sm", className } = props;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const guestName = String(form.get("guestName") ?? "").trim();
    if (!email) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/livekit/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, guestName, company, projectId, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send the invite.");
      toast.success(`Invite sent to ${email}`);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the invite.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <UserPlus className="size-4" /> Invite guest
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a guest</DialogTitle>
          <DialogDescription>
            Send an external guest a login-free link to join this meeting. The link
            is personal and expires automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="guest-email">Guest email</Label>
            <Input
              id="guest-email"
              name="email"
              type="email"
              placeholder="guest@example.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guest-name">Name (optional)</Label>
            <Input id="guest-name" name="guestName" placeholder="Their name" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

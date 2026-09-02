"use client";

import { useState } from "react";
import { Link2, Copy, Check, Loader2 } from "lucide-react";
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

/**
 * "Copy link" control for a meeting. Fetches (find-or-creates) the reusable,
 * login-free room link from /api/livekit/invite and lets the host copy it to
 * share with anyone — no per-guest email needed. Whoever opens the link types
 * their name and joins. Pass exactly one of `company` / `projectId` / `sessionId`.
 * Rendered only on staff surfaces (never the guest room).
 */
export function CopyMeetingLinkButton(props: {
  company?: string;
  projectId?: string;
  sessionId?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const { company, projectId, sessionId, variant = "outline", size = "sm", className } = props;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function loadLink() {
    setLoading(true);
    try {
      const res = await fetch("/api/livekit/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareable: true, company, projectId, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create the link.");
      setUrl(data.joinUrl as string);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the link.");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && !url) loadLink();
      }}
    >
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Link2 className="size-4" /> Copy link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shareable room link</DialogTitle>
          <DialogDescription>
            Send this link to anyone you want in the call. They enter their name
            and join — no account needed. The same link works for everyone.
          </DialogDescription>
        </DialogHeader>

        {loading || !url ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Preparing link…
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
            <Button type="button" onClick={copy} className="shrink-0">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

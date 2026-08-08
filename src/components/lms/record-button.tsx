"use client";

import { useEffect, useState } from "react";
import { Circle, Loader2, Square } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type State = "idle" | "recording" | "starting" | "stopping";

/**
 * Start/stop control for recording the current call, overlaid on the LiveKit
 * room. Only rendered for users allowed to record (instructors/admins for a
 * class, owners/super-admins for a project). Talks to /api/livekit/recording,
 * which persists the job and lets the egress webhook finalise the file.
 */
export function RecordButton({
  sessionId,
  projectId,
}: {
  sessionId?: string;
  projectId?: string;
}) {
  const query = sessionId
    ? `sessionId=${encodeURIComponent(sessionId)}`
    : `projectId=${encodeURIComponent(projectId ?? "")}`;

  const [configured, setConfigured] = useState<boolean | null>(null);
  const [state, setState] = useState<State>("idle");

  // Reflect the room's current recording state (also catches stops triggered by
  // the webhook or another host). Runs on mount and on a light poll; setState
  // only ever fires after the awaited fetch, never synchronously.
  useEffect(() => {
    let cancelled = false;
    async function sync() {
      try {
        const res = await fetch(`/api/livekit/recording?${query}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setConfigured(Boolean(data.configured));
        setState((prev) =>
          prev === "starting" || prev === "stopping"
            ? prev
            : data.recording
              ? "recording"
              : "idle"
        );
      } catch {
        /* transient — leave state as-is */
      }
    }
    const t = setInterval(sync, 8000);
    void sync();
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [query]);

  async function toggle() {
    const starting = state === "idle";
    setState(starting ? "starting" : "stopping");
    try {
      const res = await fetch("/api/livekit/recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: starting ? "start" : "stop",
          ...(sessionId ? { sessionId } : { projectId }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Recording action failed.");
      if (starting) {
        setState("recording");
        toast.success("Recording started");
      } else {
        setState("idle");
        toast.success("Recording stopped — processing the file…");
      }
    } catch (e) {
      setState(starting ? "idle" : "recording");
      toast.error(e instanceof Error ? e.message : "Recording action failed.");
    }
  }

  if (configured === false) return null; // hide entirely when not set up

  const busy = state === "starting" || state === "stopping";
  const recording = state === "recording";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy || configured === null}
      className={cn(
        "pointer-events-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-soft transition",
        "backdrop-blur disabled:opacity-60",
        recording
          ? "bg-destructive text-white hover:bg-destructive/90"
          : "bg-black/60 text-white hover:bg-black/70"
      )}
      aria-label={recording ? "Stop recording" : "Start recording"}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : recording ? (
        <Square className="size-3.5 fill-current" />
      ) : (
        <Circle className="size-3.5 fill-current text-destructive" />
      )}
      {busy ? "Working…" : recording ? "Stop recording" : "Record"}
    </button>
  );
}

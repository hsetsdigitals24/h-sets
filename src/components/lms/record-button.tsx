"use client";

import { useEffect, useState } from "react";
import { Circle, Loader2, Square } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type State = "idle" | "recording" | "starting" | "stopping";

/** Elapsed ms → clock string: "M:SS" under an hour, "H:MM:SS" beyond. */
function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/**
 * Start/stop control for recording the current call, overlaid on the LiveKit
 * room. Only rendered for users allowed to record (instructors/admins for a
 * class, owners/super-admins for a project). Talks to /api/livekit/recording,
 * which persists the job and lets the egress webhook finalise the file.
 */
export function RecordButton({
  sessionId,
  projectId,
  company,
}: {
  sessionId?: string;
  projectId?: string;
  company?: string;
}) {
  const query = sessionId
    ? `sessionId=${encodeURIComponent(sessionId)}`
    : projectId
      ? `projectId=${encodeURIComponent(projectId)}`
      : `company=${encodeURIComponent(company ?? "")}`;

  const [configured, setConfigured] = useState<boolean | null>(null);
  const [state, setState] = useState<State>("idle");
  // Epoch ms the current recording began, for the elapsed timer. Null when idle.
  const [startedAt, setStartedAt] = useState<number | null>(null);
  // Ticked each second while recording so the elapsed clock re-renders.
  const [nowTick, setNowTick] = useState(() => Date.now());

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
        // Anchor the timer to the server's start time (covers recordings begun
        // by another host or before this component mounted).
        if (data.recording?.startedAt) {
          setStartedAt((prev) => prev ?? Date.parse(data.recording.startedAt));
        } else if (!data.recording) {
          setStartedAt(null);
        }
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

  // Tick the clock while recording; elapsed is derived below so the effect never
  // calls setState synchronously.
  useEffect(() => {
    if (state !== "recording" || startedAt === null) return;
    const t = setInterval(() => setNowTick(Date.now()), 500);
    return () => clearInterval(t);
  }, [state, startedAt]);

  const elapsed =
    state === "recording" && startedAt !== null
      ? Math.max(0, nowTick - startedAt)
      : 0;

  async function toggle() {
    const starting = state === "idle";
    setState(starting ? "starting" : "stopping");
    try {
      const res = await fetch("/api/livekit/recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: starting ? "start" : "stop",
          ...(sessionId
            ? { sessionId }
            : projectId
              ? { projectId }
              : { company }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Recording action failed.");
      if (starting) {
        setStartedAt(Date.now());
        setState("recording");
        toast.success("Recording started");
      } else {
        setStartedAt(null);
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
      {busy ? (
        "Working…"
      ) : recording ? (
        <span className="inline-flex items-center gap-2">
          Stop
          <span className="tabular-nums font-semibold">{formatElapsed(elapsed)}</span>
        </span>
      ) : (
        "Record"
      )}
    </button>
  );
}

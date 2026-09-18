"use client";

import * as React from "react";
import { useParticipants } from "@livekit/components-react";

/**
 * How long the call has been running, shown as a small pill on the stage.
 *
 * The clock starts at the earliest `joinedAt` of anyone in the room — a
 * server-stamped time, so every participant sees the same figure rather than
 * their own "time since I joined". The earliest start seen is remembered for
 * the life of the component: when the person who opened the call leaves, the
 * remaining participants' joins are all later, and without that the timer would
 * jump backwards mid-call.
 */
export function CallTimer() {
  const participants = useParticipants();
  // The earliest join seen so far. A ref rather than state because it is only
  // ever read inside the ticking effect below, never during render.
  const startRef = React.useRef<number | null>(null);
  const [elapsed, setElapsed] = React.useState<number | null>(null);

  const earliestJoin = participants.reduce<number | null>((earliest, participant) => {
    const joined = participant.joinedAt?.getTime();
    if (!joined) return earliest;
    return earliest === null || joined < earliest ? joined : earliest;
  }, null);

  React.useEffect(() => {
    if (earliestJoin === null) return;
    if (startRef.current === null || earliestJoin < startRef.current) {
      startRef.current = earliestJoin;
    }
    const start = startRef.current;
    // A clock skewed ahead of the server's would otherwise render a negative
    // duration.
    const tick = () => setElapsed(Math.max(0, Date.now() - start));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [earliestJoin]);

  // Nothing to show until the server has told us when someone joined.
  if (elapsed === null) return null;

  return (
    <div
      className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1 font-mono text-sm tabular-nums text-white"
      role="timer"
      aria-label="Call duration"
    >
      {formatDuration(elapsed)}
    </div>
  );
}

/** Milliseconds as `m:ss`, widening to `h:mm:ss` once the call passes an hour. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

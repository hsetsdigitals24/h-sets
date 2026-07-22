"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Countdown to `deadline`. Calls `onExpire` once when it hits zero. Purely a
 * UX aid — the server is the source of truth for whether a submission is late.
 */
export function ExamTimer({ deadline, onExpire }: { deadline: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, deadline - Date.now()));
  const fired = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      const left = Math.max(0, deadline - Date.now());
      setRemaining(left);
      if (left <= 0 && !fired.current) {
        fired.current = true;
        clearInterval(id);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, onExpire]);

  const totalSeconds = Math.floor(remaining / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const low = totalSeconds <= 60;

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-2 text-sm font-semibold tabular-nums",
        low ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-card"
      )}
      role="timer"
      aria-live="off"
    >
      {mins}:{secs.toString().padStart(2, "0")} left
    </div>
  );
}

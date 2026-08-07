"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";

type Presence = { count: number; names: string[] };

/**
 * Meeting entry button with live presence. Polls the project's room so that
 * when a call is already running the button reads "Join meeting" and shows who
 * is on it — instead of every member seeing a static "Start meeting" with no
 * idea a meeting is in progress.
 */
export function MeetingButton({ projectId }: { projectId: string }) {
  const [presence, setPresence] = useState<Presence>({ count: 0, names: [] });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/livekit/presence?projectId=${encodeURIComponent(projectId)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setPresence(data.presence?.[projectId] ?? { count: 0, names: [] });
        }
      } catch {
        /* transient — keep last known state */
      }
    };
    load();
    const t = setInterval(load, 10_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [projectId]);

  const live = presence.count;

  return (
    <div className="flex items-center gap-2">
      {live > 0 && (
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600"
          title={presence.names.join(", ")}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          {live} in call
        </span>
      )}
      <Button asChild variant="gradient" size="sm">
        <Link href={`/meet/project/${projectId}`}>
          <Video className="size-4" /> {live > 0 ? "Join meeting" : "Start meeting"}
        </Link>
      </Button>
    </div>
  );
}

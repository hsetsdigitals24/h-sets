"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Presence = { count: number; names: string[] };
const PresenceContext = createContext<Record<string, Presence>>({});

/**
 * Polls live meeting presence for every listed project in one batched request
 * and shares it via context, so the list can show which projects have a call in
 * progress without each card firing its own request.
 */
export function ProjectsPresenceProvider({
  projectIds,
  children,
}: {
  projectIds: string[];
  children: React.ReactNode;
}) {
  const [presence, setPresence] = useState<Record<string, Presence>>({});
  // Stable dependency so the effect doesn't re-subscribe on every render.
  const idsKey = projectIds.join(",");

  useEffect(() => {
    if (!idsKey) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/livekit/presence?projectIds=${encodeURIComponent(idsKey)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setPresence(data.presence ?? {});
      } catch {
        /* transient — keep last known state */
      }
    };
    load();
    const t = setInterval(load, 12_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [idsKey]);

  return (
    <PresenceContext.Provider value={presence}>
      {children}
    </PresenceContext.Provider>
  );
}

/** Pulsing "N in call" chip; renders nothing when the project has no live call. */
export function LiveDot({ projectId }: { projectId: string }) {
  const presence = useContext(PresenceContext);
  const entry = presence[projectId];
  const count = entry?.count ?? 0;
  if (count === 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600"
      title={entry?.names.join(", ")}
    >
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
      </span>
      {count} in call
    </span>
  );
}

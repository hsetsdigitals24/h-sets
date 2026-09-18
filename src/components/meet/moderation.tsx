"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRoomInfo } from "@livekit/components-react";

type Moderation = {
  /** Whether this user may mute other people in this room. */
  canModerate: boolean;
  /** Mute someone else's microphone. `name` is only used for the toast. */
  muteParticipant: (identity: string, name: string) => Promise<void>;
  /** Identities with a mute request in flight, so tiles can show a pending state. */
  pending: ReadonlySet<string>;
};

const ModerationContext = React.createContext<Moderation>({
  canModerate: false,
  muteParticipant: async () => {},
  pending: new Set<string>(),
});

/**
 * Makes "mute someone else" available to the participant tiles.
 *
 * Muting a remote participant can only be done by the LiveKit server, so the
 * tile button posts to /api/livekit/moderation rather than touching the room
 * connection. That route re-checks permission on every call — `canModerate`
 * here only decides whether the control is worth showing, and is never the
 * thing that enforces it.
 */
export function ModerationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // useRoomInfo rather than the Room object directly: the name only arrives
  // with the server's join response, and this re-renders when it does.
  const { name: roomName } = useRoomInfo();
  const [canModerate, setCanModerate] = React.useState(false);
  const [pending, setPending] = React.useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  React.useEffect(() => {
    if (!roomName) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/livekit/moderation?room=${encodeURIComponent(roomName)}`,
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setCanModerate(Boolean(data.canModerate));
      } catch {
        // Offer nothing rather than a button that will fail: an external guest
        // (no session) lands here on every call.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomName]);

  const muteParticipant = React.useCallback(
    async (identity: string, name: string) => {
      setPending((current) => new Set(current).add(identity));
      try {
        const res = await fetch("/api/livekit/moderation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: roomName, identity }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not mute them.");
        toast.success(`Muted ${name}`, {
          description: "Only they can turn their mic back on.",
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Could not mute them.");
      } finally {
        setPending((current) => {
          const next = new Set(current);
          next.delete(identity);
          return next;
        });
      }
    },
    [roomName],
  );

  const value = React.useMemo(
    () => ({ canModerate, muteParticipant, pending }),
    [canModerate, muteParticipant, pending],
  );

  return (
    <ModerationContext.Provider value={value}>
      {children}
    </ModerationContext.Provider>
  );
}

/** Moderation state for the current room. Safe to call outside a provider. */
export function useModeration(): Moderation {
  return React.useContext(ModerationContext);
}

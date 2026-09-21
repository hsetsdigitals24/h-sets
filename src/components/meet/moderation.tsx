"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  useDataChannel,
  useLocalParticipant,
  useRoomInfo,
} from "@livekit/components-react";
import {
  UNMUTE_REQUEST_TOPIC,
  encodeUnmuteRequest,
  isUnmuteRequest,
} from "@/lib/meeting-mute";

type Moderation = {
  /** Whether this user may mute other people in this room. */
  canModerate: boolean;
  /**
   * Mute or unmute someone else's microphone. `name` is only used for the
   * toast. Unmuting falls back to asking them when the server refuses it.
   */
  setParticipantMuted: (
    identity: string,
    name: string,
    muted: boolean,
  ) => Promise<void>;
  /** Identities with a change in flight, so tiles can show a pending state. */
  pending: ReadonlySet<string>;
};

const ModerationContext = React.createContext<Moderation>({
  canModerate: false,
  setParticipantMuted: async () => {},
  pending: new Set<string>(),
});

/**
 * Makes "mute someone else" available to the participant tiles.
 *
 * Changing a remote participant's microphone can only be done by the LiveKit
 * server, so the tile button posts to /api/livekit/moderation rather than
 * touching the room connection. That route re-checks permission on every call —
 * `canModerate` here only decides whether the control is worth showing, and is
 * never the thing that enforces it.
 *
 * This provider also sits on the *receiving* end: every participant renders it,
 * so it listens for an unmute request addressed to them and offers them the
 * one-tap unmute that a host's blocked unmute falls back to.
 */
export function ModerationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // useRoomInfo rather than the Room object directly: the name only arrives
  // with the server's join response, and this re-renders when it does.
  const { name: roomName } = useRoomInfo();
  const { localParticipant } = useLocalParticipant();
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

  // Both ends of the unmute request: `send` addresses one participant, and the
  // handler fires on whoever it was addressed to.
  const { send } = useDataChannel(UNMUTE_REQUEST_TOPIC, (message) => {
    if (!isUnmuteRequest(message.payload)) return;
    const asker = message.from?.name || message.from?.identity || "The host";
    toast(`${asker} asked you to unmute`, {
      description: "Your microphone stays off until you turn it on.",
      duration: 15000,
      action: {
        label: "Unmute",
        onClick: () => {
          void localParticipant.setMicrophoneEnabled(true).catch(() => {
            toast.error("Could not turn your microphone on.");
          });
        },
      },
    });
  });

  const setParticipantMuted = React.useCallback(
    async (identity: string, name: string, muted: boolean) => {
      setPending((current) => new Set(current).add(identity));
      try {
        const res = await fetch("/api/livekit/moderation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: roomName, identity, muted }),
        });
        const data = await res.json();

        // The deployment does not allow a server-side unmute. Ask them instead
        // — which is what a host wants anyway, and is the only outcome their
        // own client can consent to.
        if (!res.ok && data.code === "unmute-blocked") {
          await send(encodeUnmuteRequest(), {
            reliable: true,
            destinationIdentities: [identity],
          });
          toast.success(`Asked ${name} to unmute`, {
            description: "Only they can turn their mic back on.",
          });
          return;
        }

        if (!res.ok) throw new Error(data.error ?? "Could not change their mic.");
        toast.success(muted ? `Muted ${name}` : `Unmuted ${name}`);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Could not change their mic.",
        );
      } finally {
        setPending((current) => {
          const next = new Set(current);
          next.delete(identity);
          return next;
        });
      }
    },
    [roomName, send],
  );

  const value = React.useMemo(
    () => ({ canModerate, setParticipantMuted, pending }),
    [canModerate, setParticipantMuted, pending],
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

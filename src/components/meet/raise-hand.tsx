"use client";

import * as React from "react";
import { Hand } from "lucide-react";
import { toast } from "sonner";
import {
  useLocalParticipant,
  useParticipantAttribute,
  useParticipants,
} from "@livekit/components-react";
import {
  HAND_ATTRIBUTE,
  HAND_DOWN,
  encodeRaisedHand,
  raisedHandAt,
} from "@/lib/meeting-hands";

/**
 * The control-bar button that raises and lowers your own hand.
 *
 * Styled with LiveKit's `lk-button` so it sits in the control bar as one of its
 * own controls, and marked `aria-pressed` because it is a toggle rather than an
 * action — a screen reader should say whether the hand is currently up.
 */
export function RaiseHandButton() {
  const { localParticipant } = useLocalParticipant();
  const raisedAt = useParticipantAttribute(HAND_ATTRIBUTE, {
    participant: localParticipant,
  });
  const raised = raisedHandAt(raisedAt) !== null;
  const [busy, setBusy] = React.useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await localParticipant.setAttributes({
        [HAND_ATTRIBUTE]: raised ? HAND_DOWN : encodeRaisedHand(),
      });
    } catch {
      // The attribute is the single source of truth for the button's state, so
      // a failed write leaves the UI honest on its own — just say it failed.
      toast.error(
        raised ? "Could not lower your hand." : "Could not raise your hand.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="lk-button"
      aria-pressed={raised}
      aria-label={raised ? "Lower your hand" : "Raise your hand"}
      disabled={busy}
      onClick={() => void toggle()}
      style={raised ? { backgroundColor: "var(--lk-accent-bg)" } : undefined}
    >
      <Hand size={20} aria-hidden />
    </button>
  );
}

/**
 * The hand shown on a participant's tile while theirs is up.
 *
 * Reads the attribute from the tile's participant context, so it follows
 * whoever the tile is for — local or remote, grid or focus view.
 */
export function RaisedHandBadge() {
  const raisedAt = useParticipantAttribute(HAND_ATTRIBUTE);

  if (raisedHandAt(raisedAt) === null) return null;

  return (
    <div
      className="absolute left-1 top-1 z-10 rounded-full bg-amber-400 p-1 text-black shadow-soft"
      title="Hand raised"
      aria-hidden
    >
      <Hand className="size-4" />
    </div>
  );
}

/**
 * Announces raised hands to screen readers.
 *
 * The tile badges are purely visual and can be off-screen entirely (a carousel
 * scrolls, a focused screen share hides the grid), so the people with their
 * hands up are also stated here — in the order they raised them, which is the
 * order a host should take them in.
 */
export function RaisedHandsAnnouncer() {
  const participants = useParticipants();

  const waiting = participants
    .map((participant) => ({
      name: participant.name || participant.identity,
      at: raisedHandAt(participant.attributes?.[HAND_ATTRIBUTE]),
    }))
    .filter((entry): entry is { name: string; at: number } => entry.at !== null)
    .sort((a, b) => a.at - b.at)
    .map((entry) => entry.name);

  return (
    <div role="status" aria-live="polite" className="sr-only">
      {waiting.length > 0 ? `Hands raised: ${waiting.join(", ")}` : ""}
    </div>
  );
}

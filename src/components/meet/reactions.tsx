"use client";

import * as React from "react";
import { Smile } from "lucide-react";
import { useDataChannel } from "@livekit/components-react";
import {
  REACTION_LIFETIME_MS,
  REACTION_TOPIC,
  REACTIONS,
  decodeReaction,
  encodeReaction,
  type ReactionEmoji,
} from "@/lib/meeting-reactions";

/** A reaction currently floating up the stage. */
type FloatingReaction = {
  id: number;
  emoji: ReactionEmoji;
  /** Display name of whoever sent it — shown under the emoji. */
  sender: string;
  /** Horizontal offset from centre, in px, so simultaneous reactions spread out. */
  offset: number;
  /** When this one should be removed from the DOM. */
  expiresAt: number;
};

/** Most reactions on screen at once, so a flood can't grow the DOM unbounded. */
const MAX_VISIBLE = 24;

/** Minimum gap between two sends from this client, in ms. */
const SEND_COOLDOWN_MS = 400;

/**
 * Sending and receiving emoji reactions for the current room.
 *
 * Reactions are published on LiveKit's data channel, which does not echo to the
 * sender — so a reaction sent locally is added to the list directly rather than
 * waiting for it to come back.
 */
export function useReactions() {
  const [reactions, setReactions] = React.useState<FloatingReaction[]>([]);
  const nextId = React.useRef(0);
  const lastSentAt = React.useRef(0);

  const add = React.useCallback((emoji: ReactionEmoji, sender: string) => {
    setReactions((current) => {
      const next: FloatingReaction = {
        id: nextId.current++,
        emoji,
        sender,
        offset: Math.round((Math.random() - 0.5) * 220),
        expiresAt: Date.now() + REACTION_LIFETIME_MS,
      };
      // Drop the oldest rather than refusing the newest, so the stage always
      // reflects what just happened even while someone is spamming.
      return [...current.slice(-(MAX_VISIBLE - 1)), next];
    });
  }, []);

  const { send } = useDataChannel(REACTION_TOPIC, (message) => {
    const emoji = decodeReaction(message.payload);
    if (!emoji) return;
    // `from` is resolved by LiveKit from the sender's token, not the payload.
    add(emoji, message.from?.name || message.from?.identity || "Someone");
  });

  const sendReaction = React.useCallback(
    (emoji: ReactionEmoji) => {
      const now = Date.now();
      if (now - lastSentAt.current < SEND_COOLDOWN_MS) return;
      lastSentAt.current = now;

      add(emoji, "You");
      // Reliable: reactions are infrequent and user-initiated, so a silently
      // dropped one reads as a broken button. A failed publish (e.g. mid
      // reconnect) is not worth interrupting the call over.
      void send(encodeReaction(emoji), { reliable: true }).catch(() => {});
    },
    [add, send]
  );

  // Sweep expired reactions on a single timer rather than one per reaction, and
  // only while something is on screen.
  React.useEffect(() => {
    if (reactions.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setReactions((current) => current.filter((r) => r.expiresAt > now));
    }, 500);
    return () => clearInterval(timer);
  }, [reactions.length]);

  return { reactions, sendReaction };
}

/**
 * The reactions floating up over the video grid.
 *
 * Absolutely positioned and non-interactive, so it never intercepts clicks
 * meant for a tile or the control bar. Its bottom edge stops above the control
 * bar so emoji drift up through the video area rather than over the buttons.
 */
export function ReactionOverlay({ reactions }: { reactions: FloatingReaction[] }) {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          bottom: "var(--lk-control-bar-height)",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        {reactions.map((reaction) => (
          <div
            key={reaction.id}
            className="animate-meet-reaction"
            style={{
              position: "absolute",
              bottom: "1rem",
              left: `calc(50% + ${reaction.offset}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.25rem",
              transform: "translateX(-50%)",
            }}
          >
            <span style={{ fontSize: "2.25rem", lineHeight: 1 }}>{reaction.emoji}</span>
            <span
              style={{
                maxWidth: "9rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                padding: "0.125rem 0.5rem",
                borderRadius: "9999px",
                background: "rgba(0, 0, 0, 0.55)",
                color: "#fff",
                fontSize: "0.6875rem",
                fontWeight: 500,
              }}
            >
              {reaction.sender}
            </span>
          </div>
        ))}
      </div>

      {/* Reactions are purely visual, so announce them separately for screen
          readers. Only the most recent is announced — a queue of every one
          would talk over the call. */}
      <div role="status" aria-live="polite" className="sr-only">
        {reactions.length > 0
          ? `${reactions[reactions.length - 1].sender} reacted ${
              reactions[reactions.length - 1].emoji
            }`
          : ""}
      </div>
    </>
  );
}

/**
 * The control-bar button that opens the emoji picker.
 *
 * Styled with LiveKit's own `lk-button` so it sits in the control bar as one of
 * its buttons rather than as an app-themed control pasted into a dark call UI.
 */
export function ReactionButton({
  onSelect,
}: {
  onSelect: (emoji: ReactionEmoji) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on a click anywhere else, or on Escape.
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="lk-button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Send a reaction"
        onClick={() => setOpen((value) => !value)}
      >
        <Smile size={20} aria-hidden />
      </button>

      {open && (
        <div
          role="group"
          aria-label="Reactions"
          style={{
            position: "absolute",
            bottom: "calc(100% + 0.5rem)",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "0.125rem",
            padding: "0.25rem",
            borderRadius: "var(--lk-border-radius)",
            border: "1px solid var(--lk-border-color)",
            background: "var(--lk-bg2)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            zIndex: 10,
          }}
        >
          {REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`React ${emoji}`}
              onClick={() => {
                onSelect(emoji);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "2.25rem",
                height: "2.25rem",
                fontSize: "1.25rem",
                lineHeight: 1,
                border: "none",
                borderRadius: "var(--lk-border-radius)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

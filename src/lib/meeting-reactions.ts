/**
 * Emoji reactions exchanged between participants during a video call.
 *
 * Reactions travel over LiveKit's data channel rather than the database: they
 * are ephemeral, live only for the few seconds they float up the stage, and
 * nothing about them needs to outlive the call. This module is the wire format
 * shared by sender and receiver, and the single place that decides which emoji
 * exist.
 *
 * A decoded reaction is remote input that ends up in the DOM, so `decode`
 * validates rather than trusts: anything outside the list below is dropped. The
 * sender is deliberately *not* part of the payload — it is read from the
 * LiveKit-authenticated participant on the message, which a peer cannot forge.
 *
 * Client-only in practice, but kept free of both server and React imports so
 * the allowed set can be reused anywhere (e.g. a future reaction summary).
 */

/** Data-channel topic. Messages on other topics are ignored by the hook. */
export const REACTION_TOPIC = "reactions";

/** How long a reaction stays on screen, in ms. Matches the CSS animation. */
export const REACTION_LIFETIME_MS = 4000;

/** The reactions a participant can send, in the order the picker shows them. */
export const REACTIONS = ["👍", "❤️", "😂", "🎉", "👏", "🙌"] as const;

export type ReactionEmoji = (typeof REACTIONS)[number];

/** Whether an unknown value is one of the reactions we recognise. */
export function isReactionEmoji(value: unknown): value is ReactionEmoji {
  return (
    typeof value === "string" && (REACTIONS as readonly string[]).includes(value)
  );
}

/** A reaction as bytes for the data channel. */
export function encodeReaction(emoji: ReactionEmoji): Uint8Array {
  return new TextEncoder().encode(JSON.stringify({ emoji }));
}

/**
 * The emoji in a received payload, or null when it is malformed, oversized, or
 * not a reaction we know about. Never throws: the bytes come from another
 * client and may be anything at all.
 */
export function decodeReaction(payload: Uint8Array): ReactionEmoji | null {
  // A legitimate reaction is a few dozen bytes; refuse to even parse more.
  if (payload.byteLength > 256) return null;
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(payload));
    if (!parsed || typeof parsed !== "object") return null;
    const { emoji } = parsed as { emoji?: unknown };
    return isReactionEmoji(emoji) ? emoji : null;
  } catch {
    return null;
  }
}

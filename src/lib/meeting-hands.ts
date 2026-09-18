/**
 * Raised hands in a video call.
 *
 * A raised hand is *state*, not an event — it stays up until its owner puts it
 * down — so unlike reactions it travels as a LiveKit participant attribute
 * rather than a data-channel message. LiveKit replays attributes to anyone who
 * joins later, so a hand raised before you arrived is still visible to you; a
 * broadcast message would have been missed.
 *
 * The value is the moment the hand went up, which gives every client the same
 * ordering ("who asked first") without a second round of messages.
 *
 * Kept free of both server and React imports so the wire format stays shared by
 * whoever needs it.
 */

/** Participant-attribute key holding the raise time. Absent/empty = hand down. */
export const HAND_ATTRIBUTE = "hand";

/** A raised hand as its attribute value. */
export function encodeRaisedHand(at: number = Date.now()): string {
  return String(at);
}

/** The attribute value meaning "hand down". LiveKit clears a key by emptying it. */
export const HAND_DOWN = "";

/**
 * When this participant raised their hand, or null if it isn't up.
 *
 * The value is set by another client and may be anything at all, so it is
 * validated rather than trusted: only a plausible epoch-ms timestamp counts as
 * a raised hand. Anything else reads as "hand down" rather than throwing or
 * sorting nonsensically.
 */
export function raisedHandAt(value?: string | null): number | null {
  if (!value) return null;
  const at = Number(value);
  if (!Number.isInteger(at) || at <= 0) return null;
  // Reject times that can't belong to a call happening now: a far-future value
  // would otherwise park that hand at the end of the queue forever.
  const hourMs = 60 * 60 * 1000;
  if (at > Date.now() + hourMs || at < Date.now() - 24 * hourMs) return null;
  return at;
}

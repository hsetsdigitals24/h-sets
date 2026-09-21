/**
 * Host-initiated microphone changes during a video call.
 *
 * Muting someone else runs through the LiveKit admin API (see
 * `muteParticipantMic`) — the server can always silence a published track.
 * *Unmuting* is not guaranteed: LiveKit rejects a server-side unmute unless the
 * deployment opts into it (`enable_remote_unmute`), because turning someone's
 * microphone back on without their say-so is a privacy decision, not a
 * technical one.
 *
 * So when the server refuses, the host's toggle falls back to what a host
 * actually wants in that moment: asking the participant to unmute. That request
 * travels over LiveKit's data channel, addressed to one participant, and their
 * client offers them a one-tap "Unmute". This module is the wire format shared
 * by both sides.
 *
 * The payload carries no sender: `from` on a received message is resolved by
 * LiveKit from the sender's token and cannot be forged by a peer.
 */

/** Data-channel topic. Messages on other topics are ignored by the hook. */
export const UNMUTE_REQUEST_TOPIC = "unmute-request";

/** An unmute request as bytes for the data channel. */
export function encodeUnmuteRequest(): Uint8Array {
  return new TextEncoder().encode(JSON.stringify({ t: "unmute-request" }));
}

/**
 * Whether a received payload is an unmute request. Never throws: the bytes come
 * from another client and may be anything at all.
 */
export function isUnmuteRequest(payload: Uint8Array): boolean {
  // A legitimate request is a few dozen bytes; refuse to even parse more.
  if (payload.byteLength > 256) return false;
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(payload));
    return (
      !!parsed &&
      typeof parsed === "object" &&
      (parsed as { t?: unknown }).t === "unmute-request"
    );
  } catch {
    return false;
  }
}

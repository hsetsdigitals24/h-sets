/**
 * How a participant's profile picture travels into a video call.
 *
 * LiveKit carries arbitrary per-participant `metadata` on the access token and
 * broadcasts it to everyone in the room, so the avatar is available to remote
 * tiles without any extra lookup. We keep the payload to a single JSON object
 * so more fields can be added later without breaking older clients.
 *
 * Shared by server (token minting) and client (tile rendering), so this module
 * stays free of server-only imports.
 */
export type MeetingParticipantMeta = {
  /** Permanent public URL of the participant's profile picture, if they have one. */
  image?: string | null;
};

/** Token metadata for a participant. Empty string when there's nothing to send. */
export function encodeParticipantMetadata(image?: string | null): string {
  return image ? JSON.stringify({ image } satisfies MeetingParticipantMeta) : "";
}

/**
 * The avatar URL from a participant's metadata, or null when they have none
 * (external guests, staff who haven't uploaded a picture, older tokens). Never
 * throws: metadata is remote input and may be anything at all.
 */
export function avatarFromMetadata(metadata?: string | null): string | null {
  if (!metadata) return null;
  try {
    const parsed: unknown = JSON.parse(metadata);
    if (!parsed || typeof parsed !== "object") return null;
    const image = (parsed as MeetingParticipantMeta).image;
    if (typeof image !== "string" || !image) return null;
    // Only ever render an https image URL — never a javascript:/data: payload.
    return image.startsWith("https://") ? image : null;
  } catch {
    return null;
  }
}

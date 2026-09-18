import { isAvatarUrl } from "@/lib/avatar";

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
  /**
   * The participant's profile picture, if they have one: a path on this app
   * (/api/users/[id]/avatar/[version], for a picture stored in the database)
   * or an absolute https URL (pictures uploaded to R2 before avatars moved
   * there).
   */
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
    // Only ever render an https URL or one of our own avatar paths — never a
    // javascript:/data: payload, and never a protocol-relative "//host" path.
    if (image.startsWith("https://")) return image;
    // isAvatarUrl rather than a pattern of our own: the two drifted apart once
    // already, and a tile then silently fell back to initials.
    return isAvatarUrl(image) ? image : null;
  } catch {
    return null;
  }
}

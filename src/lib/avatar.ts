/**
 * Where a database-backed profile picture lives.
 *
 * Shared by the upload route, the profile action and the client uploader, so
 * the URL shape is written once. Deliberately free of server-only imports.
 */

/** Profile pictures are small by design — anything larger is a mistake. */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

/** The path prefix every database-backed avatar URL starts with. */
export const AVATAR_URL_PREFIX = "/api/users/";

/**
 * The URL that serves a user's stored picture. `updatedAt` rides along as a
 * version so a replaced picture never shows through a cache.
 */
export function avatarUrlFor(userId: string, updatedAt: Date): string {
  return `${AVATAR_URL_PREFIX}${userId}/avatar?v=${updatedAt.getTime()}`;
}

/**
 * True for a URL this app itself serves an avatar from. Used to validate what
 * the profile form submits, so `User.image` can only ever be set to one of our
 * own avatar URLs or an absolute https one (pictures uploaded to R2 before
 * avatars moved into the database).
 */
export function isAvatarUrl(value: string): boolean {
  return /^\/api\/users\/[A-Za-z0-9_-]+\/avatar(\?v=\d+)?$/.test(value);
}

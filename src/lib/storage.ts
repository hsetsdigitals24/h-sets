import "server-only";
import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 storage (S3-compatible) for learning materials and assignment
 * submissions.
 *
 * Configure with env vars:
 *   R2_ACCOUNT_ID         — your Cloudflare account id
 *   R2_ACCESS_KEY_ID      — R2 API token access key
 *   R2_SECRET_ACCESS_KEY  — R2 API token secret
 *   R2_BUCKET             — the bucket name
 *
 * The bucket is kept private: files are never served directly. Uploads use a
 * short-lived presigned PUT URL (browser -> R2 directly), and downloads use a
 * short-lived presigned GET URL. If R2 isn't configured, the helpers throw a
 * clear error at call time so the rest of the app still builds and runs.
 */

const globalForR2 = globalThis as unknown as { _hsetsR2?: S3Client };

function getClient(): S3Client | null {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) return null;
  if (!globalForR2._hsetsR2) {
    globalForR2._hsetsR2 = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return globalForR2._hsetsR2;
}

function requireClient(): { client: S3Client; bucket: string } {
  const client = getClient();
  const bucket = process.env.R2_BUCKET;
  if (!client || !bucket) {
    throw new Error(
      "File storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET."
    );
  }
  return { client, bucket };
}

/** True when R2 credentials are present — lets callers show a friendly notice. */
export function isStorageConfigured(): boolean {
  return getClient() !== null && !!process.env.R2_BUCKET;
}

/** Build a namespaced, collision-safe object key from a prefix and filename. */
export function buildKey(prefix: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return `${prefix.replace(/^\/+|\/+$/g, "")}/${randomUUID()}-${safe || "file"}`;
}

/** Presigned PUT URL for a direct browser upload. Expires in 10 minutes. */
export async function presignUpload(key: string, contentType: string): Promise<string> {
  const { client, bucket } = requireClient();
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 600 }
  );
}

/**
 * Presigned GET URL to view/download a stored object. Expires in 5 minutes.
 * Pass `filename` to force a download with a friendly name.
 */
export async function presignDownload(key: string, filename?: string): Promise<string> {
  const { client, bucket } = requireClient();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ...(filename
        ? { ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, "")}"` }
        : {}),
    }),
    { expiresIn: 300 }
  );
}

/**
 * Public storage for content served directly to visitors (e.g. blog images).
 * Unlike the private bucket above, objects here are reachable at a permanent,
 * public URL. Configure with:
 *   R2_PUBLIC_BUCKET    — a bucket with public access enabled
 *   R2_PUBLIC_BASE_URL  — the public base URL (R2 public dev URL or CDN domain),
 *                         e.g. https://pub-xxxx.r2.dev or https://cdn.h-sets.com
 * Falls back to the same R2 credentials/client as the private bucket.
 */

/** True when a public bucket + base URL are configured. */
export function isPublicStorageConfigured(): boolean {
  return (
    getClient() !== null &&
    !!process.env.R2_PUBLIC_BUCKET &&
    !!process.env.R2_PUBLIC_BASE_URL
  );
}

function requirePublicConfig(): { client: S3Client; bucket: string; baseUrl: string } {
  const client = getClient();
  const bucket = process.env.R2_PUBLIC_BUCKET;
  const baseUrl = process.env.R2_PUBLIC_BASE_URL;
  if (!client || !bucket || !baseUrl) {
    throw new Error(
      "Public storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_BUCKET and R2_PUBLIC_BASE_URL."
    );
  }
  return { client, bucket, baseUrl };
}

/** The permanent public URL for an object key in the public bucket. */
export function publicUrl(key: string): string {
  const baseUrl = process.env.R2_PUBLIC_BASE_URL ?? "";
  return `${baseUrl.replace(/\/+$/, "")}/${key}`;
}

/** Presigned PUT URL for a direct browser upload to the public bucket. Expires in 10 minutes. */
export async function presignPublicUpload(key: string, contentType: string): Promise<string> {
  const { client, bucket } = requirePublicConfig();
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 600 }
  );
}

/**
 * Upload bytes to the public bucket directly from the server (no presign round
 * trip). Used when the file already lives server-side, e.g. a screenshot fetched
 * from a third-party service. Returns the permanent public URL.
 */
export async function putPublicObject(
  key: string,
  body: Uint8Array,
  contentType: string
): Promise<string> {
  const { client, bucket } = requirePublicConfig();
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
  );
  return publicUrl(key);
}

/** Delete an object. Best-effort — swallows the error if storage is unset. */
export async function deleteObject(key: string): Promise<void> {
  const client = getClient();
  const bucket = process.env.R2_BUCKET;
  if (!client || !bucket) return;
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

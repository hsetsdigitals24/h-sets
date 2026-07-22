import { z } from "zod";

/** Split a textarea value into a trimmed, non-empty string array (one per line). */
export function linesToArray(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Join a string array back into newline-separated text for editing. */
export function arrayToLines(value: unknown): string {
  return Array.isArray(value) ? value.join("\n") : "";
}

/** Escape a plain-text string for safe interpolation into HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Normalize a stored insight `body` into an HTML string.
 * - Legacy posts store `string[]` (one paragraph each) — wrapped in escaped `<p>` tags.
 * - New posts store a rich-text HTML `string` (already sanitized on write) — returned as-is.
 */
export function bodyToHtml(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((para) => `<p>${escapeHtml(String(para))}</p>`)
      .join("\n");
  }
  if (typeof value === "string") return value;
  return "";
}

/** Parse a JSON textarea field against a schema. Returns data or throws with a friendly message. */
export function parseJson<T>(
  value: FormDataEntryValue | null,
  schema: z.ZodType<T>,
  fieldLabel: string
): T {
  let raw: unknown;
  try {
    raw = JSON.parse(typeof value === "string" && value.trim() ? value : "null");
  } catch {
    throw new Error(`${fieldLabel}: invalid JSON.`);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`${fieldLabel}: ${parsed.error.issues[0]?.message ?? "invalid"}.`);
  }
  return parsed.data;
}

/** Pretty-print a JSON value for editing in a textarea. */
export function jsonToText(value: unknown): string {
  return JSON.stringify(value ?? [], null, 2);
}

/** Slugify a string for URL-safe identifiers. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type ContentActionState = { ok?: boolean; error?: string };

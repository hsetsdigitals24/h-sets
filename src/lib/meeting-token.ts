/**
 * Shared token fetch for every meeting room client (class, project, company
 * standup, guest invite).
 *
 * Exists because all four rooms previously did `await res.json()` *before*
 * checking `res.ok`. A throttled or interrupted request upstream — Prisma
 * Postgres exceeding its plan's query rate limit, LiveKit Cloud's REST API, or
 * the hosting edge — answers 429 with an HTML or plain-text body, so the parse
 * threw first and the joiner saw `Unexpected token '<'` instead of the status
 * that actually explains the failure.
 *
 * Here the body is read as text once, then parsed opportunistically, so the
 * HTTP status always survives into the message the user sees and into the
 * console for diagnosis.
 */

export type MeetingConnection = {
  token: string;
  url: string;
  room: string;
  identity: string;
  label?: string;
};

/** Human-readable reason for a failed join, keyed off the status code. */
function statusMessage(status: number, retryAfter: string | null): string {
  if (status === 429) {
    const wait = retryAfter ? ` Try again in ${retryAfter}s.` : " Try again shortly.";
    return `Too many requests upstream (429) — the call could not be set up.${wait}`;
  }
  if (status === 401) return "Your session expired. Sign in again to join.";
  if (status === 503) return "Video is not configured yet (503).";
  if (status >= 500) return `The server failed to set up the call (HTTP ${status}).`;
  return `Could not join the call (HTTP ${status}).`;
}

/**
 * GETs `url` and returns the connection details, throwing an Error whose
 * message names the real HTTP status when anything goes wrong.
 * `fallback` is the generic wording used when the response carries no `error`
 * field and the status alone isn't more specific.
 */
export async function fetchMeetingToken(
  url: string,
  fallback: string
): Promise<MeetingConnection> {
  const res = await fetch(url);

  // Read the body as text first: a 429/502 from a proxy is often HTML, and
  // res.json() would throw over the status we need to report.
  const raw = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }
  const serverError =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>).error
      : undefined;

  if (!res.ok) {
    // Always log the full picture — status, URL and body snippet — so a 429 can
    // be confirmed from the browser console rather than guessed at.
    console.error(
      `[meet] token request failed: ${res.status} ${res.statusText} ${url}`,
      raw.slice(0, 500)
    );
    throw new Error(
      typeof serverError === "string" && serverError
        ? serverError
        : statusMessage(res.status, res.headers.get("Retry-After"))
    );
  }

  if (!parsed || typeof parsed !== "object") {
    console.error(`[meet] token response was not JSON: ${url}`, raw.slice(0, 500));
    throw new Error(fallback);
  }

  return parsed as MeetingConnection;
}

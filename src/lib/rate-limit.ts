import "server-only";

/**
 * Lightweight in-memory fixed-window rate limiter for public endpoints.
 *
 * NOTE: state lives in the process, so on a multi-instance/serverless host the
 * limit is enforced per instance, not globally. That still blocks the common
 * abuse case (one client hammering one instance) and is a big improvement over
 * no limit. For a hard global limit, swap the Map for Upstash/Redis or a
 * Postgres counter behind the same `rateLimit()` signature.
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();
let lastSweep = 0;

/** Drop expired buckets occasionally so the Map doesn't grow unbounded. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of store) {
    if (b.resetAt <= now) store.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

/**
 * Record a hit for `key` and report whether it's within `limit` per `windowMs`.
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { ok: true, remaining: limit - existing.count, retryAfterSec: 0 };
}

/**
 * Best-effort client IP from proxy headers (Vercel/Cloudflare set these). Falls
 * back to a shared bucket when no header is present, which fails safe (all
 * header-less callers share one limit) rather than granting everyone their own.
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

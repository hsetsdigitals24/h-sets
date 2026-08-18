import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { rateLimit, clientIp } from "./rate-limit";
import { checkBotSignals } from "./bot-guard";

/** Default abuse guard for public form endpoints: 20 submissions/min per IP. */
const DEFAULT_RATE = { limit: 20, windowMs: 60_000 };

/**
 * Wraps an API route: rate-limits per client IP, parses + validates the JSON
 * body against `schema`, then runs `handler`. Returns consistent JSON responses
 * and status codes, and never leaks internal error details to the client.
 *
 * `options.rate` overrides the per-IP limit (e.g. tighter for costly handlers).
 */
export function createPostHandler<T>(
  schema: ZodSchema<T>,
  handler: (data: T) => Promise<{ message: string; data?: unknown }>,
  options?: { rate?: { limit: number; windowMs: number } }
) {
  const rate = options?.rate ?? DEFAULT_RATE;
  return async function POST(req: Request) {
    // Throttle before doing any work (parsing, DB writes, email sends).
    const key = `${new URL(req.url).pathname}:${clientIp(req)}`;
    const rl = rateLimit(key, rate);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    // Drop automated submissions (honeypot filled / superhumanly fast). We
    // return a normal-looking success and simply do no work, so a bot can't
    // tell it was caught and tune its way past the check.
    const bot = checkBotSignals((field) => {
      if (!body || typeof body !== "object" || Array.isArray(body)) return undefined;
      const v = (body as Record<string, unknown>)[field];
      return typeof v === "string" ? v : undefined;
    });
    if (!bot.ok) {
      return NextResponse.json({ ok: true, message: "Received." }, { status: 201 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = (parsed.error as ZodError).flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed.", fieldErrors },
        { status: 422 }
      );
    }

    try {
      const result = await handler(parsed.data);
      return NextResponse.json({ ok: true, ...result }, { status: 201 });
    } catch (err) {
      console.error("[api] handler error:", err);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
}

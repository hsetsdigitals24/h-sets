import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

/**
 * Wraps an API route: parses + validates the JSON body against `schema`, then
 * runs `handler`. Returns consistent JSON responses and status codes, and never
 * leaks internal error details to the client.
 */
export function createPostHandler<T>(
  schema: ZodSchema<T>,
  handler: (data: T) => Promise<{ message: string; data?: unknown }>
) {
  return async function POST(req: Request) {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
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

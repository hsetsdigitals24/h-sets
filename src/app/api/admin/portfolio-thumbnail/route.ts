import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccess } from "@/lib/rbac";
import { buildKey, putPublicObject, isPublicStorageConfigured } from "@/lib/storage";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Captures a screenshot of a project's live landing page (top viewport = the
 * hero) via the Microlink API, re-hosts the PNG in our public R2 bucket so it's
 * permanent, and returns the public URL for use as a portfolio card thumbnail.
 * Gated to users with the `portfolio` admin section.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAccess(session.user.role, "portfolio")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isPublicStorageConfigured()) {
    return NextResponse.json(
      { error: "Image uploads are not configured." },
      { status: 503 }
    );
  }

  let body: { url?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { url } = body;
  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json({ error: "Missing landing page URL." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url.trim());
  } catch {
    return NextResponse.json({ error: "Enter a valid URL." }, { status: 400 });
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "URL must start with http:// or https://" }, { status: 400 });
  }

  // Ask Microlink for a top-viewport screenshot (the above-the-fold hero).
  const api = new URL("https://api.microlink.io/");
  api.searchParams.set("url", target.toString());
  api.searchParams.set("screenshot", "true");
  api.searchParams.set("meta", "false");
  api.searchParams.set("viewport.width", "1200");
  api.searchParams.set("viewport.height", "630");

  let shotUrl: string;
  try {
    const res = await fetch(api.toString(), { headers: { Accept: "application/json" } });
    const data = (await res.json()) as {
      status?: string;
      data?: { screenshot?: { url?: string } };
      message?: string;
    };
    if (!res.ok || data.status !== "success" || !data.data?.screenshot?.url) {
      return NextResponse.json(
        { error: data.message ?? "Could not capture a screenshot of that page." },
        { status: 502 }
      );
    }
    shotUrl = data.data.screenshot.url;
  } catch {
    return NextResponse.json(
      { error: "Screenshot service is unavailable. Try again." },
      { status: 502 }
    );
  }

  // Re-host the captured PNG on our own public bucket so it doesn't expire.
  try {
    const img = await fetch(shotUrl);
    if (!img.ok) {
      return NextResponse.json({ error: "Could not download the screenshot." }, { status: 502 });
    }
    const bytes = new Uint8Array(await img.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Screenshot is too large." }, { status: 502 });
    }
    const contentType = img.headers.get("content-type") ?? "image/png";
    const thumbnail = await putPublicObject(buildKey("portfolio", "hero.png"), bytes, contentType);
    return NextResponse.json({ thumbnail });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not store the screenshot." },
      { status: 500 }
    );
  }
}

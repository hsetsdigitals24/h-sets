import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canAccess } from "@/lib/rbac";
import {
  buildKey,
  presignPublicUpload,
  publicUrl,
  isPublicStorageConfigured,
} from "@/lib/storage";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Presigns a direct-to-R2 upload for an inline blog (insight) image. Gated to
 * users with the `insights` admin section. Returns a short-lived PUT URL plus
 * the permanent public URL the editor embeds in the article body.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canAccess(session.user.role, "insights")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isPublicStorageConfigured()) {
    return NextResponse.json(
      { error: "Image uploads are not configured." },
      { status: 503 }
    );
  }

  let body: { filename?: unknown; contentType?: unknown; size?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { filename, contentType, size } = body;
  if (typeof filename !== "string" || typeof contentType !== "string") {
    return NextResponse.json({ error: "Missing filename or contentType." }, { status: 400 });
  }
  if (!contentType.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
  }
  if (typeof size === "number" && size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller." }, { status: 400 });
  }

  try {
    const key = buildKey("insights", filename);
    const uploadUrl = await presignPublicUpload(key, contentType);
    return NextResponse.json({ uploadUrl, publicUrl: publicUrl(key) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not start upload." },
      { status: 500 }
    );
  }
}

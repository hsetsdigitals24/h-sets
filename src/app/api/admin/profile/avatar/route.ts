import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { avatarUrlFor, MAX_AVATAR_BYTES } from "@/lib/avatar";

/**
 * Stores the caller's own profile picture as a blob in Postgres and returns the
 * URL that serves it back. A route handler rather than a server action because
 * the body is a file and server actions cap at 1 MB by default.
 *
 * The picture is written immediately, but it only becomes the member's avatar
 * when they save the profile form (which persists the returned URL to
 * `User.image`) — same two-step shape the presigned R2 upload had.
 */
export async function POST(req: Request) {
  const user = await requireUser();
  if (user.role === "STUDENT") {
    return NextResponse.json({ error: "Staff only." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return NextResponse.json(
      { error: "Profile picture must be 5 MB or smaller." },
      { status: 413 }
    );
  }

  const data = Buffer.from(await file.arrayBuffer());
  // Trust the bytes over the browser-declared type for the size check.
  if (data.byteLength > MAX_AVATAR_BYTES) {
    return NextResponse.json(
      { error: "Profile picture must be 5 MB or smaller." },
      { status: 413 }
    );
  }

  const saved = await prisma.userAvatar.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      data,
      contentType: file.type,
      sizeBytes: data.byteLength,
    },
    update: { data, contentType: file.type, sizeBytes: data.byteLength },
  });

  return NextResponse.json({ url: avatarUrlFor(user.id, saved.updatedAt) });
}

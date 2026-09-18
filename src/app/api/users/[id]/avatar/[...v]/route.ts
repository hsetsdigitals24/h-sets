import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Serves a profile picture stored as a blob in Postgres.
 *
 * Public by design, exactly as the public R2 bucket was: the picture is shown in
 * the admin header, the users list and in video-call tiles, where external
 * guests hold a LiveKit token but no session of ours. The only thing a caller
 * can get is the avatar of a user id they already know.
 *
 * The version rides in the *path* (/api/users/[id]/avatar/[updatedAt]) rather
 * than a query string: next/image refuses to optimise a local URL that carries
 * a search string, so a ?v= version would 400 every avatar in the UI. The URL
 * therefore only ever names one version of the picture and can be cached hard;
 * a new upload changes the URL.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const avatar = await prisma.userAvatar.findUnique({ where: { userId: id } });
  if (!avatar) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const etag = `"${avatar.updatedAt.getTime()}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }

  return new NextResponse(new Uint8Array(avatar.data), {
    headers: {
      "Content-Type": avatar.contentType,
      "Content-Length": String(avatar.sizeBytes),
      ETag: etag,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

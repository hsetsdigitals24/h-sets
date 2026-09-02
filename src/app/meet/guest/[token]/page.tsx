import Link from "next/link";
import type { Metadata } from "next";
import { VideoOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { GuestRoom } from "./room";

export const dynamic = "force-dynamic";
// Guest links are private, one-off, and must never be indexed.
export const metadata: Metadata = {
  title: "Join meeting",
  robots: { index: false, follow: false },
};

/** Human-readable reason this invite can't be joined, or null if it's good. */
function inviteProblem(
  invite: { expiresAt: Date; revokedAt: Date | null } | null
): string | null {
  if (!invite) return "This invite link is not valid.";
  if (invite.revokedAt) return "This invite has been revoked.";
  if (invite.expiresAt.getTime() < Date.now()) return "This invite link has expired.";
  return null;
}

export default async function GuestMeetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Server-side pre-check so an expired/revoked/unknown link shows a friendly
  // message instead of dumping the guest into a failing room. The actual token
  // mint (and its own re-validation) happens in /api/livekit/guest-token.
  const invite = await prisma.meetingInvite.findUnique({
    where: { token },
    select: { label: true, expiresAt: true, revokedAt: true, shareable: true },
  });

  const problem = inviteProblem(invite);

  if (problem || !invite) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <VideoOff className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{problem}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={site.url}>Go to {site.name}</Link>
        </Button>
      </div>
    );
  }

  return (
    <GuestRoom token={token} title={invite.label} promptName={invite.shareable} />
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Video } from "lucide-react";
import { requireSection } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeading } from "@/components/admin/page-heading";
import { Button } from "@/components/ui/button";
import {
  companyRoomBySlug,
  finalizeInFlightRecordings,
} from "@/lib/livekit";
import { isNoteTakerConfigured } from "@/lib/meeting-notes";
import { RecordingsList } from "@/components/lms/recordings-list";
import { InviteGuestButton } from "@/components/meet/invite-guest-button";
import { CopyMeetingLinkButton } from "@/components/meet/copy-meeting-link-button";

export const dynamic = "force-dynamic";

/**
 * A single company standup room: entry to the call plus its recordings. Any
 * staff member can play/download/delete the recordings and generate AI notes —
 * company rooms have no owner (mirrors canRecordCompany).
 */
export default async function StandupRoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSection("standups");
  const { slug } = await params;

  const room = await companyRoomBySlug(slug);
  if (!room) notFound();

  // Self-heal any recordings stuck in-flight (webhook never reached us) before
  // reading them, so a stopped recording finalises to READY/FAILED on view.
  await finalizeInFlightRecordings({ companyRoomId: room.id });
  const recordings = await prisma.recording.findMany({
    where: { companyRoomId: room.id },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      status: true,
      durationSec: true,
      sizeBytes: true,
      startedAt: true,
      notes: { select: { status: true, summary: true, transcript: true, error: true } },
    },
  });

  return (
    <div>
      <PageHeading
        back={{ href: "/admin/standups", label: "Back to standups" }}
        title={room.name}
        description={room.description ?? "Company standup room."}
      />

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Button asChild>
          <Link href={`/meet/company/${room.slug}`}>
            <Video className="size-4" /> Start call
          </Link>
        </Button>
        <CopyMeetingLinkButton company={room.slug} />
        <InviteGuestButton company={room.slug} />
      </div>

      <h2 className="mb-3 text-sm font-semibold tracking-tight">
        Recordings
      </h2>
      <RecordingsList
        recordings={recordings}
        canManage
        canGenerate
        notesEnabled={isNoteTakerConfigured()}
      />
    </div>
  );
}

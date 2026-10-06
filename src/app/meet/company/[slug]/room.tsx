"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, VideoOff } from "lucide-react";
import {
  LiveKitRoom,
  formatChatMessageLinks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { MeetingStage } from "@/components/meet/meeting-stage";
import { Button } from "@/components/ui/button";
import { RecordButton } from "@/components/lms/record-button";
import { InviteGuestButton } from "@/components/meet/invite-guest-button";
import { shouldExitOnDisconnect } from "@/lib/meeting-disconnect";
import { joinErrorMessage } from "@/lib/meeting-token";
import { useMeetingConnection } from "@/components/meet/use-meeting-connection";
import { MeetingPreJoin, type JoinChoices } from "@/components/meet/prejoin";

/**
 * Client-side LiveKit room for a company-wide standup. Mirrors the project room
 * but is scoped to a company room (identified by slug) and returns to the
 * standups directory on disconnect. Every internal staff member can join; the
 * call can be recorded to the private bucket (no attendance is tracked —
 * standups are informal).
 */
export function CompanyRoom({
  slug,
  title,
  canRecord = false,
}: {
  slug: string;
  title: string;
  canRecord?: boolean;
}) {
  const [leaving, setLeaving] = useState(false);
  // Mic/camera choices from the pre-join screen; null until the user joins,
  // which gates the token fetch below.
  const [choices, setChoices] = useState<JoinChoices | null>(null);

  const homeHref = "/admin/standups";

  const { conn, error, setError, reconnecting, rejoin, onConnected } =
    useMeetingConnection(
      choices ? `/api/livekit/token?company=${encodeURIComponent(slug)}` : null,
      "Could not join the standup."
    );

  if (error) {
    return (
      <Centered>
        <VideoOff className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={homeHref}>Back to standups</Link>
        </Button>
      </Centered>
    );
  }

  // Pre-join: pick mic/camera state before connecting to the room.
  if (!choices) {
    return (
      <MeetingPreJoin title={title} joinLabel="Join standup" onJoin={setChoices} />
    );
  }

  // Once we start leaving, unmount the LiveKit tree immediately (see project
  // room note) to avoid MeetingStage throwing during track teardown.
  if (!conn || leaving) {
    return (
      <Centered>
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {leaving
            ? "Leaving…"
            : reconnecting
              ? "Reconnecting…"
              : `Joining ${title}…`}
        </p>
      </Centered>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full" data-lk-theme="default">
      <LiveKitRoom
        token={conn.token}
        serverUrl={conn.url}
        connect
        video={choices.videoEnabled}
        audio={choices.audioEnabled}
        options={{
          videoCaptureDefaults: choices.videoDeviceId
            ? { deviceId: choices.videoDeviceId }
            : undefined,
          audioCaptureDefaults: choices.audioDeviceId
            ? { deviceId: choices.audioDeviceId }
            : undefined,
        }}
        onError={(e) => {
          // A failed connect is fatal (nothing is running); a failed track
          // publish — denied camera, missing mic — is not, and must leave the
          // call standing. joinErrorMessage() returns null for the latter.
          const message = joinErrorMessage(e);
          if (message) setError(message);
        }}
        onDisconnected={(reason) => {
          if (shouldExitOnDisconnect(reason)) {
            setLeaving(true);
            window.location.href = homeHref;
          } else {
            // Transient drop — stay in the standup and reconnect in place.
            rejoin();
          }
        }}
        onConnected={onConnected}
        style={{ height: "100%" }}
      >
        <MeetingStage
          chatMessageFormatter={formatChatMessageLinks}
          title={title}
          onConnectionStale={rejoin}
        />
      </LiveKitRoom>
      <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex flex-wrap justify-center gap-2 px-20 sm:px-4 [&>*]:pointer-events-auto">
        {canRecord && <RecordButton company={slug} />}
        <InviteGuestButton company={slug} />
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-background">
      {children}
    </div>
  );
}

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
import { site } from "@/lib/site";
import { shouldExitOnDisconnect } from "@/lib/meeting-disconnect";
import { joinErrorMessage } from "@/lib/meeting-token";
import { useMeetingConnection } from "@/components/meet/use-meeting-connection";
import { MeetingPreJoin, type JoinChoices } from "@/components/meet/prejoin";

/**
 * Login-free video room for an invited external guest. Identical UX to the staff
 * rooms but scoped by the invite token (not a session), with no recording
 * control. On leave the guest is returned to the marketing site rather than any
 * authenticated area.
 *
 * Everyone passes through the pre-join screen to set their mic and camera. A
 * shareable "room link" (`promptName`) is opened by many different people, so
 * that screen also asks for a display name; a personal invite already knows who
 * the guest is.
 */
export function GuestRoom({
  token,
  title,
  promptName = false,
}: {
  token: string;
  title: string;
  promptName?: boolean;
}) {
  const [leaving, setLeaving] = useState(false);
  // Mic/camera choices from the pre-join screen; null until the joiner submits
  // it, which gates the token fetch below. For a shareable link the same screen
  // also collects a display name — personal invites already know who the guest
  // is.
  const [choices, setChoices] = useState<JoinChoices | null>(null);

  // Wait for the pre-join step before minting a token.
  const tokenUrl = choices
    ? `/api/livekit/guest-token?${new URLSearchParams({
        token,
        ...(choices.name ? { name: choices.name } : {}),
      }).toString()}`
    : null;
  const { conn, error, setError, reconnecting, rejoin, onConnected } =
    useMeetingConnection(tokenUrl, "Could not join the meeting.");

  if (error) {
    return (
      <Centered>
        <VideoOff className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={site.url}>Go to {site.name}</Link>
        </Button>
      </Centered>
    );
  }

  // Pre-join: pick mic/camera state (and a display name for shareable links)
  // before connecting to the meeting.
  if (!choices) {
    return (
      <MeetingPreJoin
        title={title}
        askName={promptName}
        joinLabel="Join call"
        onJoin={setChoices}
      />
    );
  }

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
            window.location.href = site.url;
          } else {
            // Transient drop — stay in the meeting and reconnect in place.
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

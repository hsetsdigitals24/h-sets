"use client";

import { useEffect, useState } from "react";
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
import { fetchMeetingToken } from "@/lib/meeting-token";
import { MeetingPreJoin, type JoinChoices } from "@/components/meet/prejoin";

type TokenResponse = { token: string; url: string; room: string; identity: string };

/**
 * Client-side LiveKit room for a class call. Fetches a scoped token from
 * /api/livekit/token, then renders LiveKit's prebuilt conference UI (grid,
 * active speaker, mute, screen share, chat). Attendance is handled entirely
 * server-side via the LiveKit webhook — nothing to do here.
 */
export function ClassRoom({
  sessionId,
  title,
  isStudent,
  canRecord = false,
}: {
  sessionId: string;
  title: string;
  isStudent: boolean;
  canRecord?: boolean;
}) {
  const [conn, setConn] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  // Bumped to force a fresh token fetch + LiveKitRoom remount after a transient
  // drop (e.g. the tab was backgrounded and the connection froze).
  const [attempt, setAttempt] = useState(0);
  const [reconnecting, setReconnecting] = useState(false);
  // Mic/camera choices from the pre-join screen; null until the user joins,
  // which gates the token fetch below.
  const [choices, setChoices] = useState<JoinChoices | null>(null);

  useEffect(() => {
    if (!choices) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchMeetingToken(
          `/api/livekit/token?sessionId=${encodeURIComponent(sessionId)}`,
          "Could not join the call."
        );
        if (!cancelled) {
          setConn(data);
          setReconnecting(false);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to join.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, attempt, choices]);

  const homeHref = isStudent ? "/account" : "/admin";

  if (error) {
    return (
      <Centered>
        <VideoOff className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={homeHref}>Back</Link>
        </Button>
      </Centered>
    );
  }

  // Pre-join: pick mic/camera state before connecting to the room.
  if (!choices) {
    return (
      <MeetingPreJoin title={title} joinLabel="Join class" onJoin={setChoices} />
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
        onDisconnected={(reason) => {
          if (shouldExitOnDisconnect(reason)) {
            setLeaving(true);
            window.location.href = homeHref;
          } else {
            // Transient drop — stay in the call and reconnect in place.
            setConn(null);
            setReconnecting(true);
            setAttempt((n) => n + 1);
          }
        }}
        style={{ height: "100%" }}
      >
        <MeetingStage chatMessageFormatter={formatChatMessageLinks} />
      </LiveKitRoom>
      {!isStudent && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex flex-wrap justify-center gap-2 px-20 sm:px-4 [&>*]:pointer-events-auto">
          {canRecord && <RecordButton sessionId={sessionId} />}
          <InviteGuestButton sessionId={sessionId} />
        </div>
      )}
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

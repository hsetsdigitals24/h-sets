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
import { site } from "@/lib/site";
import { shouldExitOnDisconnect } from "@/lib/meeting-disconnect";
import { MeetingPreJoin, type JoinChoices } from "@/components/meet/prejoin";

type TokenResponse = {
  token: string;
  url: string;
  room: string;
  label: string;
  identity: string;
};

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
  const [conn, setConn] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  // Mic/camera choices from the pre-join screen; null until the joiner submits
  // it, which gates the token fetch below. For a shareable link the same screen
  // also collects a display name — personal invites already know who the guest
  // is.
  const [choices, setChoices] = useState<JoinChoices | null>(null);
  // Bumped to force a fresh token fetch + LiveKitRoom remount after a transient
  // drop (e.g. the tab was backgrounded and the connection froze).
  const [attempt, setAttempt] = useState(0);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    // Wait for the pre-join step before minting a token.
    if (!choices) return;
    let cancelled = false;
    (async () => {
      try {
        const qs = new URLSearchParams({ token });
        if (choices.name) qs.set("name", choices.name);
        const res = await fetch(`/api/livekit/guest-token?${qs.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not join the meeting.");
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
  }, [token, attempt, choices]);

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
        onDisconnected={(reason) => {
          if (shouldExitOnDisconnect(reason)) {
            setLeaving(true);
            window.location.href = site.url;
          } else {
            // Transient drop — stay in the meeting and reconnect in place.
            setConn(null);
            setReconnecting(true);
            setAttempt((n) => n + 1);
          }
        }}
        style={{ height: "100%" }}
      >
        <MeetingStage chatMessageFormatter={formatChatMessageLinks} />
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

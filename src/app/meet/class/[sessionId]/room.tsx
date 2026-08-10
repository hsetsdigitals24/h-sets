"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, VideoOff } from "lucide-react";
import {
  LiveKitRoom,
  VideoConference,
  formatChatMessageLinks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Button } from "@/components/ui/button";
import { RecordButton } from "@/components/lms/record-button";
import { InviteGuestButton } from "@/components/meet/invite-guest-button";

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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/livekit/token?sessionId=${encodeURIComponent(sessionId)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not join the call.");
        if (!cancelled) setConn(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to join.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

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

  if (!conn) {
    return (
      <Centered>
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Joining {title}…</p>
      </Centered>
    );
  }

  return (
    <div className="relative h-screen w-screen" data-lk-theme="default">
      <LiveKitRoom
        token={conn.token}
        serverUrl={conn.url}
        connect
        video
        audio
        onDisconnected={() => {
          window.location.href = homeHref;
        }}
        style={{ height: "100%" }}
      >
        <VideoConference chatMessageFormatter={formatChatMessageLinks} />
      </LiveKitRoom>
      {!isStudent && (
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center gap-2 [&>*]:pointer-events-auto">
          {canRecord && <RecordButton sessionId={sessionId} />}
          <InviteGuestButton sessionId={sessionId} />
        </div>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-background">
      {children}
    </div>
  );
}

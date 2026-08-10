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
import { site } from "@/lib/site";

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
 */
export function GuestRoom({ token, title }: { token: string; title: string }) {
  const [conn, setConn] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/livekit/guest-token?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not join the meeting.");
        if (!cancelled) setConn(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to join.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

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

  if (!conn || leaving) {
    return (
      <Centered>
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {leaving ? "Leaving…" : `Joining ${title}…`}
        </p>
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
          setLeaving(true);
          window.location.href = site.url;
        }}
        style={{ height: "100%" }}
      >
        <VideoConference chatMessageFormatter={formatChatMessageLinks} />
      </LiveKitRoom>
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

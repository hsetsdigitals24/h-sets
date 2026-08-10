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

type TokenResponse = { token: string; url: string; room: string; identity: string };

/**
 * Client-side LiveKit room for a company-wide standup. Mirrors the project room
 * but is scoped to a curated company room (identified by slug) and returns to
 * the standups directory on disconnect. Every internal staff member can join;
 * no attendance/participation is recorded (standups are informal).
 */
export function CompanyRoom({ slug, title }: { slug: string; title: string }) {
  const [conn, setConn] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const homeHref = "/admin/standups";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/livekit/token?company=${encodeURIComponent(slug)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not join the standup.");
        if (!cancelled) setConn(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to join.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

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

  // Once we start leaving, unmount the LiveKit tree immediately (see project
  // room note) to avoid VideoConference throwing during track teardown.
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
          window.location.href = homeHref;
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

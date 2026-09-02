"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, VideoOff, Video } from "lucide-react";
import {
  LiveKitRoom,
  VideoConference,
  formatChatMessageLinks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { site } from "@/lib/site";
import { shouldExitOnDisconnect } from "@/lib/meeting-disconnect";

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
 * A shareable "room link" (`promptName`) is opened by many different people, so
 * it first asks the joiner for a display name; a personal invite already knows
 * who the guest is and joins straight away.
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
  // For a shareable link the joiner supplies their own name; null until they do,
  // which gates the token fetch below. Personal invites skip straight past this.
  const [name, setName] = useState<string | null>(promptName ? null : "");
  // Bumped to force a fresh token fetch + LiveKitRoom remount after a transient
  // drop (e.g. the tab was backgrounded and the connection froze).
  const [attempt, setAttempt] = useState(0);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    // Wait for the name step (shareable links) before minting a token.
    if (name === null) return;
    let cancelled = false;
    (async () => {
      try {
        const qs = new URLSearchParams({ token });
        if (name) qs.set("name", name);
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
  }, [token, attempt, name]);

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

  // Shareable link: ask for a display name before joining.
  if (name === null) {
    return (
      <Centered>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value = new FormData(e.currentTarget).get("name");
            const trimmed = String(value ?? "").trim();
            if (trimmed) setName(trimmed);
          }}
          className="w-full max-w-xs space-y-4 rounded-2xl border border-border bg-card p-6 text-left shadow-soft"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-11 items-center justify-center rounded-xl bg-muted">
              <Video className="size-5 text-muted-foreground" />
            </span>
            <div>
              <h1 className="text-base font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">
                Enter your name to join the call.
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guest-display-name">Your name</Label>
            <Input
              id="guest-display-name"
              name="name"
              placeholder="e.g. Ada Obi"
              maxLength={60}
              autoFocus
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Join call
          </Button>
        </form>
      </Centered>
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
    <div className="relative h-screen w-screen" data-lk-theme="default">
      <LiveKitRoom
        token={conn.token}
        serverUrl={conn.url}
        connect
        video
        audio
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

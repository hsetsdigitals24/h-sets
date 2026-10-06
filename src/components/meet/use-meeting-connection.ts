"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { fetchMeetingToken, type MeetingConnection } from "@/lib/meeting-token";

/**
 * Backoff for the token request after a rejoin. A phone coming back to the
 * call often has its network still waking up, so the first request can fail
 * for reasons that clear on their own a second later — giving up on it would
 * throw the joiner out of the call instead of reconnecting them.
 */
const REJOIN_RETRY_DELAYS_MS = [1000, 2000, 4000, 8000];

/**
 * Token + rejoin state shared by every meeting room client (class, project,
 * company standup, guest invite).
 *
 * `tokenUrl` is null until the joiner has passed the pre-join screen, which
 * gates the first fetch. `rejoin()` drops the current connection and mints a
 * fresh token, remounting `<LiveKitRoom>` — used after a transient disconnect
 * and when a backgrounded tab returns to a connection LiveKit is still
 * struggling to resume. `onConnected` goes on `<LiveKitRoom>` so the joiner is
 * told when a rejoin has actually landed.
 */
export function useMeetingConnection(tokenUrl: string | null, fallback: string) {
  const [conn, setConn] = useState<MeetingConnection | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Bumped to force a fresh token fetch + LiveKitRoom remount.
  const [attempt, setAttempt] = useState(0);
  const [reconnecting, setReconnecting] = useState(false);
  // Set by rejoin() and cleared once the remounted room connects, so the
  // "back in the call" toast fires once per drop and never on the first join.
  const awaitingRejoin = useRef(false);

  useEffect(() => {
    if (!tokenUrl) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async (retry: number) => {
      try {
        const data = await fetchMeetingToken(tokenUrl, fallback);
        if (!cancelled) {
          setConn(data);
          setReconnecting(false);
        }
      } catch (e) {
        if (cancelled) return;
        // Only a rejoin retries: a first join that fails should say why at once.
        const delay = attempt > 0 ? REJOIN_RETRY_DELAYS_MS[retry] : undefined;
        if (delay !== undefined) {
          timer = setTimeout(() => void load(retry + 1), delay);
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to join.");
      }
    };

    void load(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [tokenUrl, fallback, attempt]);

  const rejoin = useCallback(() => {
    awaitingRejoin.current = true;
    setConn(null);
    setReconnecting(true);
    setAttempt((n) => n + 1);
  }, []);

  const onConnected = useCallback(() => {
    if (!awaitingRejoin.current) return;
    awaitingRejoin.current = false;
    toast.success("You're back in the call.");
  }, []);

  return { conn, error, setError, reconnecting, rejoin, onConnected };
}

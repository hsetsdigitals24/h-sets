"use client";

import * as React from "react";
import { PictureInPicture2 } from "lucide-react";
import { toast } from "sonner";
import { ConnectionState, Track, type VideoTrack } from "livekit-client";
import {
  isTrackReference,
  useConnectionState,
  useLocalParticipant,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { site } from "@/lib/site";

/**
 * How long a returning tab gives LiveKit's own resume to recover before we
 * abandon it and rejoin with a fresh token. After a long time in the
 * background the server has usually dropped us already, and LiveKit's retry
 * backoff — whose delays piled up while the tab was frozen — can otherwise keep
 * the joiner on "Reconnecting" for tens of seconds.
 */
const STALE_RESUME_GRACE_MS = 3000;

/**
 * Keeps a call as alive as a browser allows when a phone leaves the page.
 *
 * Mobile browsers suspend a backgrounded page, so a web call can't fully run
 * in the background (iOS is strictest; Android keeps audio going for a page
 * that is still playing sound). This component does what is possible:
 *
 * - On a phone, turns the camera off while the page is hidden and back on when
 *   it returns. The OS stops the camera anyway; doing it ourselves shows the
 *   others the avatar instead of a frozen frame.
 * - Holds a screen wake lock so the phone doesn't auto-lock mid-call, since a
 *   locked screen backgrounds the page just like switching apps does.
 * - Registers Media Session metadata and call actions (mute, camera, hang up,
 *   Picture-in-Picture) so the browser can show call controls outside the tab.
 * - Offers a Picture-in-Picture button that floats a remote video over other
 *   apps, keeping the call on screen while the joiner is elsewhere.
 * - When the page returns to a connection that is still reconnecting, calls
 *   `onStale` after a short grace period so the room can rejoin with a fresh
 *   token instead of waiting out LiveKit's backoff.
 *
 * Must render inside `<LiveKitRoom>`.
 */
export function BackgroundCallSupport({
  title,
  onStale,
}: {
  title?: string;
  onStale?: () => void;
}) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } =
    useLocalParticipant();
  const pip = usePictureInPicture();

  // Read through refs inside the long-lived listeners below, so they always see
  // the latest values without re-registering on every render.
  const onStaleRef = React.useRef(onStale);
  const enterPipRef = React.useRef(pip.enter);
  React.useEffect(() => {
    onStaleRef.current = onStale;
    enterPipRef.current = pip.enter;
  });

  // Camera pause + stale-connection rejoin, both driven by page visibility.
  React.useEffect(() => {
    const mobile = isMobileDevice();
    let pausedCamera = false;
    let staleTimer: ReturnType<typeof setTimeout> | undefined;

    const onVisibilityChange = () => {
      clearTimeout(staleTimer);

      if (document.visibilityState === "hidden") {
        // Desktop browsers keep capturing in a background tab, and someone
        // switching to their slides expects to stay on camera — so phones only.
        if (mobile && room.localParticipant.isCameraEnabled) {
          pausedCamera = true;
          void room.localParticipant.setCameraEnabled(false).catch(() => {});
        }
        return;
      }

      if (pausedCamera) {
        pausedCamera = false;
        void room.localParticipant.setCameraEnabled(true).catch(() => {
          toast.error("Could not turn your camera back on.");
        });
      }

      if (isResuming(room.state)) {
        staleTimer = setTimeout(() => {
          if (isResuming(room.state)) onStaleRef.current?.();
        }, STALE_RESUME_GRACE_MS);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearTimeout(staleTimer);
    };
  }, [room]);

  // Screen wake lock. The browser releases it whenever the page is hidden, so
  // it is re-requested each time the page becomes visible again.
  React.useEffect(() => {
    if (!("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let disposed = false;

    const acquire = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (disposed) void lock.release();
        else sentinel = lock;
      } catch {
        // Refused (battery saver, unsupported context) — the call works without it.
      }
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void sentinel?.release().catch(() => {});
    };
  }, []);

  // Media Session metadata and call actions.
  React.useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    session.metadata = new MediaMetadata({
      title: title ?? "Live call",
      artist: site.name,
    });

    const handlers: Record<string, () => void> = {
      togglemicrophone: () =>
        void room.localParticipant
          .setMicrophoneEnabled(!room.localParticipant.isMicrophoneEnabled)
          .catch(() => {}),
      togglecamera: () =>
        void room.localParticipant
          .setCameraEnabled(!room.localParticipant.isCameraEnabled)
          .catch(() => {}),
      hangup: () => void room.disconnect(),
      enterpictureinpicture: () => void enterPipRef.current(),
    };
    const registered: string[] = [];
    for (const [action, handler] of Object.entries(handlers)) {
      try {
        // These call actions are newer than the DOM typings; browsers that
        // don't know an action throw, which just means it isn't offered.
        session.setActionHandler(action as MediaSessionAction, handler);
        registered.push(action);
      } catch {
        // Unsupported action.
      }
    }

    return () => {
      session.metadata = null;
      for (const action of registered) {
        try {
          session.setActionHandler(action as MediaSessionAction, null);
        } catch {
          // Ignore.
        }
      }
    };
  }, [room, title]);

  // Keep the browser's call controls showing the real mic/camera state.
  React.useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    const session = navigator.mediaSession as MediaSession & {
      setMicrophoneActive?: (active: boolean) => void;
      setCameraActive?: (active: boolean) => void;
    };
    session.setMicrophoneActive?.(isMicrophoneEnabled);
    session.setCameraActive?.(isCameraEnabled);
  }, [localParticipant, isMicrophoneEnabled, isCameraEnabled]);

  const showButton =
    pip.supported && connectionState === ConnectionState.Connected;
  const label = pip.active
    ? "Close picture-in-picture"
    : "Pop out the call (picture-in-picture)";

  // The video element stays at the same spot in the tree whatever else renders,
  // so it is never remounted out from under the listeners bound to it.
  return (
    <>
      {pip.element}
      {showButton && (
        <div className="absolute right-4 top-4 z-10">
          <button
            type="button"
            className="lk-button"
            aria-label={label}
            aria-pressed={pip.active}
            title={
              pip.available
                ? label
                : "Picture-in-picture needs someone with their camera or screen share on"
            }
            disabled={!pip.available}
            onClick={() => void (pip.active ? pip.exit() : pip.enter())}
            style={
              pip.active ? { backgroundColor: "var(--lk-accent-bg)" } : undefined
            }
          >
            <PictureInPicture2 size={20} aria-hidden />
          </button>
        </div>
      )}
    </>
  );
}

/**
 * Picture-in-Picture for the call's most relevant remote video: a screen share
 * if there is one, otherwise the camera of whoever spoke most recently.
 *
 * The browser API only floats a `<video>` element, and the stage's tiles come
 * and go with the layout, so the chosen track is mirrored into a dedicated
 * near-invisible video element that lives as long as the call does.
 */
function usePictureInPicture() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [active, setActive] = React.useState(false);
  // Read on the client only; the server render (and hydration) assume no PiP.
  const supported = React.useSyncExternalStore(
    noopSubscribe,
    () => document.pictureInPictureEnabled === true,
    () => false,
  );

  const tracks = useTracks(
    [
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Camera, withPlaceholder: false },
    ],
    { onlySubscribed: true },
  );

  const candidates = tracks
    .filter(isTrackReference)
    .filter(
      (ref) =>
        !ref.participant.isLocal && !ref.publication.isMuted && ref.publication.track,
    );
  const best =
    candidates.find((ref) => ref.source === Track.Source.ScreenShare) ??
    [...candidates].sort(
      (a, b) =>
        (b.participant.lastSpokeAt?.getTime() ?? 0) -
        (a.participant.lastSpokeAt?.getTime() ?? 0),
    )[0];
  const track = best?.publication.track as VideoTrack | undefined;

  // Mirror the chosen track into the PiP element; if no remote video is left,
  // close the window rather than leave it showing a black frame.
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!track) {
      if (document.pictureInPictureElement === video) {
        void document.exitPictureInPicture().catch(() => {});
      }
      return;
    }
    track.attach(video);
    return () => {
      track.detach(video);
    };
  }, [track]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnter = () => setActive(true);
    const onLeave = () => setActive(false);
    video.addEventListener("enterpictureinpicture", onEnter);
    video.addEventListener("leavepictureinpicture", onLeave);
    return () => {
      video.removeEventListener("enterpictureinpicture", onEnter);
      video.removeEventListener("leavepictureinpicture", onLeave);
      if (document.pictureInPictureElement === video) {
        void document.exitPictureInPicture().catch(() => {});
      }
    };
  }, []);

  const enter = React.useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.srcObject) return;
    try {
      await video.requestPictureInPicture();
    } catch {
      toast.error("Picture-in-picture isn't available right now.");
    }
  }, []);

  const exit = React.useCallback(async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture().catch(() => {});
    }
  }, []);

  // Kept rendered (not display:none) because some browsers refuse PiP for a
  // video that isn't laid out.
  const element = (
    <video
      ref={videoRef}
      muted
      playsInline
      aria-hidden
      tabIndex={-1}
      className="pointer-events-none fixed bottom-0 right-0 size-px opacity-0"
    />
  );

  return { supported, active, available: !!track, enter, exit, element };
}

/** PiP support never changes during a page's life, so there is nothing to watch. */
function noopSubscribe(): () => void {
  return () => {};
}

/** Whether LiveKit is trying to resume a connection that dropped. */
function isResuming(state: ConnectionState): boolean {
  return (
    state === ConnectionState.Reconnecting ||
    state === ConnectionState.SignalReconnecting
  );
}

/** Phones and tablets, including iPadOS, which reports itself as a Mac. */
function isMobileDevice(): boolean {
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } })
    .userAgentData;
  if (uaData?.mobile) return true;
  const ua = navigator.userAgent;
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}

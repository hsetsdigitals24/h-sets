"use client";

import * as React from "react";
import { Track } from "livekit-client";
import { Loader2, Mic, MicOff } from "lucide-react";
import {
  isTrackReference,
  useEnsureTrackRef,
  useIsMuted,
  ParticipantTile,
  ParticipantName,
  TrackMutedIndicator,
  ConnectionQualityIndicator,
  VideoTrack,
  AudioTrack,
  FocusToggle,
  ScreenShareIcon,
  type ParticipantTileProps,
} from "@livekit/components-react";
import { avatarFromMetadata } from "@/lib/meeting-identity";
import { initialsOf } from "@/components/ui/avatar";
import { useModeration } from "@/components/meet/moderation";
import { RaisedHandBadge } from "@/components/meet/raise-hand";
import { cn } from "@/lib/utils";

/**
 * A `ParticipantTile` that shows the participant's profile picture instead of
 * LiveKit's generic silhouette when their camera is off.
 *
 * The body mirrors LiveKit's own default tile content (video/audio track,
 * placeholder, metadata bar, focus toggle) — passing children to
 * `ParticipantTile` replaces that default wholesale, so everything it provides
 * has to be reproduced here. The placeholder keeps LiveKit's
 * `lk-participant-placeholder` class, so the library's own CSS still handles
 * fading it in and out as the camera is muted and unmuted.
 */
export function AvatarParticipantTile(props: ParticipantTileProps) {
  return (
    <ParticipantTile {...props}>
      <TileBody />
    </ParticipantTile>
  );
}

function TileBody() {
  // Provided by ParticipantTile for its children.
  const trackRef = useEnsureTrackRef();
  const { participant } = trackRef;
  const isCamera = trackRef.source === Track.Source.Camera;
  const isVideo =
    trackRef.publication?.kind === "video" ||
    isCamera ||
    trackRef.source === Track.Source.ScreenShare;

  return (
    <>
      {isTrackReference(trackRef) &&
        (isVideo ? (
          <VideoTrack trackRef={trackRef} manageSubscription />
        ) : (
          <AudioTrack trackRef={trackRef} />
        ))}

      <div className="lk-participant-placeholder">
        <ParticipantAvatar
          name={participant.name || participant.identity}
          metadata={participant.metadata}
        />
      </div>

      <div className="lk-participant-metadata">
        <div className="lk-participant-metadata-item">
          {isCamera ? (
            <>
              <TrackMutedIndicator
                trackRef={{ participant, source: Track.Source.Microphone }}
                show="muted"
              />
              <ParticipantName />
            </>
          ) : (
            <>
              <ScreenShareIcon style={{ marginRight: "0.25rem" }} />
              <ParticipantName>&apos;s screen</ParticipantName>
            </>
          )}
        </div>
        <ConnectionQualityIndicator className="lk-participant-metadata-item" />
      </div>

      {/* Only on the camera tile: a raised hand belongs to the person, not to
          each track they publish, so it would otherwise double up next to a
          screen share. */}
      {isCamera && <RaisedHandBadge />}
      {isCamera && <ParticipantMuteToggle />}
      <FocusToggle trackRef={trackRef} />
    </>
  );
}

/**
 * Toggles the microphone of the participant on this tile — offered only to
 * hosts (see `ModerationProvider`), and only on someone else's tile.
 *
 * Always visible rather than revealed on hover: a phone or tablet has no hover,
 * so a hover-only control simply does not exist on the devices most likely to
 * need it. It also stays on screen once the person is muted, showing their
 * current state — pressed means muted — so a host can see at a glance who they
 * silenced and put them back.
 *
 * Unmuting is a request, not a command, wherever LiveKit refuses a server-side
 * unmute: `setParticipantMuted` falls back to asking the participant, who taps
 * their own unmute. The button state follows their real mic either way, so it
 * never claims to have unmuted someone who is still muted.
 */
function ParticipantMuteToggle() {
  const { participant } = useEnsureTrackRef();
  const { canModerate, setParticipantMuted, pending } = useModeration();
  const micMuted = useIsMuted({ participant, source: Track.Source.Microphone });

  if (!canModerate || participant.isLocal) return null;

  const name = participant.name || participant.identity;
  const busy = pending.has(participant.identity);
  const label = micMuted ? `Ask ${name} to unmute` : `Mute ${name}`;

  return (
    <button
      type="button"
      onClick={() =>
        void setParticipantMuted(participant.identity, name, !micMuted)
      }
      disabled={busy}
      aria-pressed={micMuted}
      // Sits just left of LiveKit's focus toggle, which is pinned at right:
      // 0.25rem and is roughly 1.5rem wide.
      className={cn(
        "absolute right-8 top-1 z-10 rounded p-1 text-white transition",
        "hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white/70",
        "disabled:opacity-60",
        micMuted ? "bg-red-600/80" : "bg-black/50",
      )}
      title={label}
      aria-label={label}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : micMuted ? (
        <MicOff className="size-4" />
      ) : (
        <Mic className="size-4" />
      )}
    </button>
  );
}

/**
 * The picture shown in place of a camera feed: the participant's uploaded
 * profile picture, or their initials when they have none (external guests, or
 * staff who haven't uploaded one yet).
 *
 * A plain <img> rather than next/image: the URL arrives at runtime from another
 * participant's LiveKit metadata, which next/image cannot pre-validate against
 * its remote-pattern allowlist. `avatarFromMetadata` restricts it to https.
 */
function ParticipantAvatar({
  name,
  metadata,
}: {
  name: string;
  metadata?: string;
}) {
  const src = avatarFromMetadata(metadata);
  // Remember which URL failed to load rather than a bare boolean, so a picture
  // that is later changed is retried instead of staying permanently hidden.
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);

  if (src && src !== failedSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        onError={() => setFailedSrc(src)}
        style={{
          width: "35%",
          maxWidth: "9rem",
          aspectRatio: "1 / 1",
          objectFit: "cover",
          borderRadius: "9999px",
          padding: 0,
        }}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "35%",
        maxWidth: "9rem",
        aspectRatio: "1 / 1",
        borderRadius: "9999px",
        background: "rgba(255, 255, 255, 0.12)",
        color: "#fff",
        fontSize: "clamp(1rem, 4vw, 2.5rem)",
        fontWeight: 600,
        letterSpacing: "0.02em",
      }}
    >
      {initialsOf(name)}
    </span>
  );
}

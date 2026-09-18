"use client";

import * as React from "react";
import { Track } from "livekit-client";
import { Loader2, MicOff } from "lucide-react";
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
    // `group` lets the hover-revealed mute button below follow the same
    // show-on-hover behaviour LiveKit's own CSS gives the focus toggle.
    <ParticipantTile {...props} className={cn("group", props.className)}>
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
      {isCamera && <MuteParticipantButton />}
      <FocusToggle trackRef={trackRef} />
    </>
  );
}

/**
 * Mutes the participant on this tile — offered only to hosts (see
 * `ModerationProvider`), and only for someone else's live microphone.
 *
 * There is no unmute counterpart: the server can silence a mic but cannot turn
 * one back on, so the person muted stays in control of their own audio.
 */
function MuteParticipantButton() {
  const { participant } = useEnsureTrackRef();
  const { canModerate, muteParticipant, pending } = useModeration();
  const micMuted = useIsMuted({ participant, source: Track.Source.Microphone });

  if (!canModerate || participant.isLocal || micMuted) return null;

  const name = participant.name || participant.identity;
  const busy = pending.has(participant.identity);

  return (
    <button
      type="button"
      onClick={() => void muteParticipant(participant.identity, name)}
      disabled={busy}
      // Sits just left of LiveKit's focus toggle, which is pinned at right:
      // 0.25rem and is roughly 1.5rem wide.
      className={cn(
        "absolute right-8 top-1 z-10 rounded p-1 text-white opacity-0 transition",
        "bg-black/50 hover:bg-black/70 focus-visible:opacity-100 group-hover:opacity-100",
        "disabled:opacity-60",
      )}
      title={`Mute ${name}`}
      aria-label={`Mute ${name}`}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <MicOff className="size-4" />
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

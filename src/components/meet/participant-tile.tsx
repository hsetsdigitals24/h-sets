"use client";

import * as React from "react";
import { Track } from "livekit-client";
import {
  isTrackReference,
  useEnsureTrackRef,
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

      <FocusToggle trackRef={trackRef} />
    </>
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

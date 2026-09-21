"use client";

import * as React from "react";
import { RoomEvent, Track } from "livekit-client";
import type {
  TrackReferenceOrPlaceholder,
  WidgetState,
} from "@livekit/components-core";
import {
  isTrackReference,
  useCreateLayoutContext,
  usePinnedTracks,
  useTracks,
  CarouselLayout,
  Chat,
  ConnectionStateToast,
  ControlBar,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  RoomAudioRenderer,
  type MessageFormatter,
} from "@livekit/components-react";
import { AvatarParticipantTile } from "@/components/meet/participant-tile";
import { CallTimer } from "@/components/meet/call-timer";
import { ModerationProvider } from "@/components/meet/moderation";
import {
  RaiseHandButton,
  RaisedHandsAnnouncer,
} from "@/components/meet/raise-hand";
import {
  ReactionButton,
  ReactionOverlay,
  useReactions,
} from "@/components/meet/reactions";

/**
 * The in-call stage: grid of participants, screen-share focus view, control bar
 * and chat.
 *
 * This is a like-for-like replacement for LiveKit's `<VideoConference>` prefab,
 * reproduced here for one reason: the prefab renders its own `ParticipantTile`
 * internally with no way to swap it, and we need tiles that show a participant's
 * profile picture when their camera is off. Everything else — pinning a screen
 * share, the carousel of other participants, chat — behaves exactly as the
 * prefab does, plus an emoji reaction button the prefab has no equivalent for.
 */
export function MeetingStage({
  chatMessageFormatter,
}: {
  chatMessageFormatter?: MessageFormatter;
}) {
  const [widgetState, setWidgetState] = React.useState<WidgetState>({
    showChat: false,
    unreadMessages: 0,
    showSettings: false,
  });
  const lastAutoFocusedScreenShareTrack =
    React.useRef<TrackReferenceOrPlaceholder | null>(null);

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false },
  );

  const { reactions, sendReaction } = useReactions();
  const layoutContext = useCreateLayoutContext();
  const screenShareTracks = tracks
    .filter(isTrackReference)
    .filter((track) => track.publication.source === Track.Source.ScreenShare);
  const focusTrack = usePinnedTracks(layoutContext)?.[0];
  const carouselTracks = tracks.filter(
    (track) => !isEqualTrackRef(track, focusTrack),
  );

  // A stable key for the current screen-share state, so the effect below re-runs
  // when one starts, stops, or finishes subscribing (and not on every render).
  const screenShareKey = screenShareTracks
    .map(
      (track) =>
        `${track.publication.trackSid}_${track.publication.isSubscribed}`,
    )
    .join();

  // Auto-pin a screen share as soon as one starts, and release the pin when it
  // stops — mirroring the prefab so a shared screen is never buried in the grid.
  React.useEffect(() => {
    if (
      screenShareTracks.some((track) => track.publication.isSubscribed) &&
      lastAutoFocusedScreenShareTrack.current === null
    ) {
      layoutContext.pin.dispatch?.({
        msg: "set_pin",
        trackReference: screenShareTracks[0],
      });
      lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
    } else if (
      lastAutoFocusedScreenShareTrack.current &&
      !screenShareTracks.some(
        (track) =>
          track.publication.trackSid ===
          lastAutoFocusedScreenShareTrack.current?.publication?.trackSid,
      )
    ) {
      layoutContext.pin.dispatch?.({ msg: "clear_pin" });
      lastAutoFocusedScreenShareTrack.current = null;
    }

    // A pinned placeholder that has since published a real track needs to be
    // re-pinned to the live track, or the focus view stays empty.
    if (focusTrack && !isTrackReference(focusTrack)) {
      const updated = tracks.find(
        (track) =>
          track.participant.identity === focusTrack.participant.identity &&
          track.source === focusTrack.source,
      );
      if (updated && updated !== focusTrack && isTrackReference(updated)) {
        layoutContext.pin.dispatch?.({
          msg: "set_pin",
          trackReference: updated,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenShareKey, focusTrack?.publication?.trackSid, tracks]);

  return (
    <div className="lk-video-conference">
      <ModerationProvider>
        <LayoutContextProvider
          value={layoutContext}
          onWidgetChange={setWidgetState}
        >
          <div
            className="lk-video-conference-inner"
            style={{ position: "relative" }}
          >
            {focusTrack ? (
              <div className="lk-focus-layout-wrapper">
                <FocusLayoutContainer>
                  <CarouselLayout tracks={carouselTracks}>
                    <AvatarParticipantTile />
                  </CarouselLayout>
                  {/* The focused tile is a direct child of the container: the
                    container itself is `.lk-focus-layout` (a `1fr 5fr` grid of
                    carousel + focus), so wrapping the tile in a second element
                    of that class nests a grid and pins the share into the
                    narrow first column. */}
                  <AvatarParticipantTile trackRef={focusTrack} />
                </FocusLayoutContainer>
              </div>
            ) : (
              <div className="lk-grid-layout-wrapper">
                <GridLayout tracks={tracks}>
                  <AvatarParticipantTile />
                </GridLayout>
              </div>
            )}
            <CallTimer />
            <RaisedHandsAnnouncer />
            <ReactionOverlay reactions={reactions} />
            {/* The stage above is sized as `100% - --lk-control-bar-height`, so
              the reaction button shares the control bar's row rather than
              adding one of its own. `meet-control-row` (globals.css) lays the
              row out, and tightens its spacing on phone-width screens where
              these two extra buttons would otherwise push the leave button off
              the edge of the viewport. */}
            <div className="meet-control-row">
              <RaiseHandButton />
              <ReactionButton onSelect={sendReaction} />
              <ControlBar
                controls={{ chat: true, settings: false }}
                style={{ borderTop: "none" }}
              />
            </div>
          </div>
          <Chat
            style={{ display: widgetState.showChat ? "grid" : "none" }}
            messageFormatter={chatMessageFormatter}
          />
        </LayoutContextProvider>
      </ModerationProvider>
      <RoomAudioRenderer />
      <ConnectionStateToast />
    </div>
  );
}

/** Whether two track references point at the same participant track. */
function isEqualTrackRef(
  a?: TrackReferenceOrPlaceholder,
  b?: TrackReferenceOrPlaceholder,
): boolean {
  if (!a || !b) return false;
  if (isTrackReference(a) && isTrackReference(b)) {
    return a.publication.trackSid === b.publication.trackSid;
  }
  return (
    a.participant.identity === b.participant.identity && a.source === b.source
  );
}

import { DisconnectReason } from "livekit-client";

/**
 * Decide what a LiveKit `onDisconnected` event should do.
 *
 * A backgrounded / minimized tab gets its timers throttled and its WebSocket
 * frozen by the browser, so LiveKit eventually reports the participant as
 * disconnected with a *transient* reason (connection timeout, signal close,
 * etc.). We must NOT treat that as "the user left" — otherwise minimizing the
 * window ejects them from the room. We only leave the room for good when the
 * disconnect is intentional (they clicked Leave) or genuinely terminal (removed
 * by an admin, room closed, duplicate identity). Everything else is treated as
 * a recoverable drop and the room is reconnected in place.
 */
export function shouldExitOnDisconnect(reason?: DisconnectReason): boolean {
  switch (reason) {
    // The local participant asked to leave (Leave button → room.disconnect()).
    case DisconnectReason.CLIENT_INITIATED:
    // Terminal: rejoining is impossible or unwanted, so send them home.
    case DisconnectReason.DUPLICATE_IDENTITY:
    case DisconnectReason.PARTICIPANT_REMOVED:
    case DisconnectReason.ROOM_DELETED:
    case DisconnectReason.USER_REJECTED:
      return true;
    // UNKNOWN_REASON, SERVER_SHUTDOWN, STATE_MISMATCH, JOIN_FAILURE, MIGRATION,
    // SIGNAL_CLOSE, CONNECTION_TIMEOUT, MEDIA_FAILURE, and an undefined reason
    // are all treated as recoverable — attempt to reconnect rather than exit.
    default:
      return false;
  }
}

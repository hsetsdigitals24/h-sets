import { RecordingsListClient } from "./recordings-list-client";

export type RecordingNotes = {
  status: string;
  summary: string | null;
  transcript: string | null;
  error: string | null;
};

export type RecordingRow = {
  id: string;
  status: string;
  durationSec: number | null;
  sizeBytes: bigint | null;
  startedAt: Date;
  notes?: RecordingNotes | null;
};

/**
 * Server wrapper: maps the Prisma rows (with `bigint`/`Date` that can't cross
 * the server→client boundary) into a serializable shape, then hands off to the
 * interactive {@link RecordingsListClient}. `canManage` gates the delete action
 * and `canGenerate` gates the AI-notes action — both endpoints enforce the same
 * rules server-side regardless. `notesEnabled` reflects whether the note-taker
 * is configured (OPENAI_API_KEY set); when false the notes UI is hidden.
 */
export function RecordingsList({
  recordings,
  canManage = false,
  canGenerate = false,
  notesEnabled = false,
}: {
  recordings: RecordingRow[];
  canManage?: boolean;
  canGenerate?: boolean;
  notesEnabled?: boolean;
}) {
  const rows = recordings.map((r) => ({
    id: r.id,
    status: r.status,
    durationSec: r.durationSec,
    sizeBytes: r.sizeBytes === null ? null : Number(r.sizeBytes),
    startedAt: r.startedAt.toISOString(),
    notes: r.notes ?? null,
  }));
  return (
    <RecordingsListClient
      recordings={rows}
      canManage={canManage}
      canGenerate={canGenerate}
      notesEnabled={notesEnabled}
    />
  );
}

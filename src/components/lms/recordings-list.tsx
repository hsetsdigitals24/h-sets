import { RecordingsListClient } from "./recordings-list-client";

export type RecordingRow = {
  id: string;
  status: string;
  durationSec: number | null;
  sizeBytes: bigint | null;
  startedAt: Date;
};

/**
 * Server wrapper: maps the Prisma rows (with `bigint`/`Date` that can't cross
 * the server→client boundary) into a serializable shape, then hands off to the
 * interactive {@link RecordingsListClient}. `canManage` gates the delete action
 * — the DELETE endpoint enforces the same rule server-side regardless.
 */
export function RecordingsList({
  recordings,
  canManage = false,
}: {
  recordings: RecordingRow[];
  canManage?: boolean;
}) {
  const rows = recordings.map((r) => ({
    id: r.id,
    status: r.status,
    durationSec: r.durationSec,
    sizeBytes: r.sizeBytes === null ? null : Number(r.sizeBytes),
    startedAt: r.startedAt.toISOString(),
  }));
  return <RecordingsListClient recordings={rows} canManage={canManage} />;
}

import { Download, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export type RecordingRow = {
  id: string;
  status: string;
  durationSec: number | null;
  sizeBytes: bigint | null;
  startedAt: Date;
};

/** Human-readable clock from a seconds count, e.g. 3725 → "1h 2m". */
function formatDuration(sec: number | null): string | null {
  if (!sec || sec <= 0) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatSize(bytes: bigint | null): string | null {
  if (!bytes || bytes <= BigInt(0)) return null;
  const mb = Number(bytes) / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
}

/**
 * Renders a call's recordings with a download link per READY item. In-progress
 * recordings show a status badge instead of a link. Used on the admin roster
 * page and the student learning centre.
 */
export function RecordingsList({ recordings }: { recordings: RecordingRow[] }) {
  if (recordings.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
        No recordings yet. Start one from the call to capture the session.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {recordings.map((r) => {
        const meta = [formatDuration(r.durationSec), formatSize(r.sizeBytes)]
          .filter(Boolean)
          .join(" · ");
        const ready = r.status === "READY";
        return (
          <li key={r.id} className="flex items-center gap-3 px-4 py-3">
            <Video className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">
                {formatDate(r.startedAt.toISOString())}
              </div>
              {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
            </div>
            {ready ? (
              <Button asChild variant="outline" size="sm">
                <a href={`/api/livekit/recording/${r.id}/download`} target="_blank" rel="noreferrer">
                  <Download className="size-4" />
                  Download
                </a>
              </Button>
            ) : (
              <Badge variant={r.status === "FAILED" ? "muted" : "outline"}>
                {r.status === "FAILED"
                  ? "Failed"
                  : r.status === "PROCESSING"
                    ? "Processing…"
                    : "Recording…"}
              </Badge>
            )}
          </li>
        );
      })}
    </ul>
  );
}

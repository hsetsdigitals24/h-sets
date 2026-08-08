"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Play, Trash2, Video } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

export type ClientRecording = {
  id: string;
  status: string;
  durationSec: number | null;
  sizeBytes: number | null;
  startedAt: string;
};

/** Human-readable clock from a seconds count, e.g. 3725 → "1h 2m". */
function formatDuration(sec: number | null): string | null {
  if (!sec || sec <= 0) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatSize(bytes: number | null): string | null {
  if (!bytes || bytes <= 0) return null;
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
}

/**
 * Interactive list of a call's recordings. READY items can be played inline
 * (modal <video> streamed from the private bucket via the download route),
 * downloaded, and — when `canManage` — deleted. In-progress items show a status
 * badge instead. Rendered by {@link RecordingsList}.
 */
export function RecordingsListClient({
  recordings,
  canManage,
}: {
  recordings: ClientRecording[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [playing, setPlaying] = useState<ClientRecording | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ClientRecording | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/livekit/recording/${pendingDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not delete the recording.");
      }
      toast.success("Recording deleted");
      setPendingDelete(null);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete the recording.");
    } finally {
      setDeleting(false);
    }
  }

  if (recordings.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
        No recordings yet. Start one from the call to capture the session.
      </p>
    );
  }

  return (
    <>
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
                <div className="text-sm font-medium">{formatDate(r.startedAt)}</div>
                {meta && <div className="text-xs text-muted-foreground">{meta}</div>}
              </div>
              {ready ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPlaying(r)}>
                    <Play className="size-4" />
                    Play
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`/api/livekit/recording/${r.id}/download?download=1`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="size-4" />
                      <span className="sr-only sm:not-sr-only">Download</span>
                    </a>
                  </Button>
                  {canManage && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete(r)}
                      aria-label="Delete recording"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant={r.status === "FAILED" ? "muted" : "outline"}>
                    {r.status === "FAILED"
                      ? "Failed"
                      : r.status === "PROCESSING"
                        ? "Processing…"
                        : "Recording…"}
                  </Badge>
                  {canManage && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete(r)}
                      aria-label="Delete recording"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Dialog open={playing !== null} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {playing ? `Recording · ${formatDate(playing.startedAt)}` : "Recording"}
            </DialogTitle>
          </DialogHeader>
          {playing && (
            <video
              key={playing.id}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full rounded-lg bg-black"
              src={`/api/livekit/recording/${playing.id}/download`}
            >
              Your browser can’t play this recording.
            </video>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && !deleting && setPendingDelete(null)}
        title="Delete recording?"
        description="This permanently removes the recording and its video file. This can't be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        destructive
        pending={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}

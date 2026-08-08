"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Download,
  Loader2,
  Play,
  Sparkles,
  Trash2,
  Video,
} from "lucide-react";
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

export type ClientNotes = {
  status: string;
  summary: string | null;
  transcript: string | null;
  error: string | null;
};

export type ClientRecording = {
  id: string;
  status: string;
  durationSec: number | null;
  sizeBytes: number | null;
  startedAt: string;
  notes: ClientNotes | null;
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
  canGenerate,
  notesEnabled,
}: {
  recordings: ClientRecording[];
  canManage: boolean;
  canGenerate: boolean;
  notesEnabled: boolean;
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
            <li key={r.id} className="px-4 py-3">
              <div className="flex items-center gap-3">
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
              </div>
              {notesEnabled && ready && (
                <NotesPanel recordingId={r.id} notes={r.notes} canGenerate={canGenerate} />
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

/**
 * AI note-taker panel shown under a READY recording. Transcribes + summarises
 * the call on demand via POST /api/livekit/recording/[id]/notes. The request is
 * awaited synchronously (transcription can take tens of seconds), so no polling
 * is needed — on success we refresh to render the notes the server just wrote.
 * `canGenerate` mirrors the record permission (owner / super admin); viewers
 * without it still read finished notes but can't spend on generation.
 */
function NotesPanel({
  recordingId,
  notes,
  canGenerate,
}: {
  recordingId: string;
  notes: ClientNotes | null;
  canGenerate: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const ready = notes?.status === "READY";
  const failed = notes?.status === "FAILED";
  // PENDING rows are created when the recording finalises but haven't been run.
  const generated = ready && notes?.summary;

  async function generate() {
    setBusy(true);
    try {
      const res = await fetch(`/api/livekit/recording/${recordingId}/notes`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not generate notes.");
      toast.success("Meeting notes ready");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not generate notes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ml-7 mt-2 rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Sparkles className="size-3.5 text-primary" />
          AI meeting notes
        </div>
        {canGenerate && (
          <Button variant="outline" size="sm" onClick={generate} disabled={busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {busy ? "Generating…" : generated ? "Regenerate" : "Generate notes"}
          </Button>
        )}
      </div>

      {generated ? (
        <>
          <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {notes!.summary}
          </div>
          {notes!.transcript && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowTranscript((s) => !s)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ChevronDown
                  className={`size-3.5 transition-transform ${showTranscript ? "rotate-180" : ""}`}
                />
                {showTranscript ? "Hide transcript" : "Show full transcript"}
              </button>
              {showTranscript && (
                <div className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-background p-3 text-xs leading-relaxed text-muted-foreground">
                  {notes!.transcript}
                </div>
              )}
            </div>
          )}
        </>
      ) : failed ? (
        <p className="mt-2 text-xs text-destructive">
          {notes?.error ?? "Note generation failed."}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          {busy
            ? "Transcribing and summarising the call…"
            : canGenerate
              ? "No notes yet — generate a transcript and summary from this recording."
              : "Notes haven’t been generated for this meeting yet."}
        </p>
      )}
    </div>
  );
}

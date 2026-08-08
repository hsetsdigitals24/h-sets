import "server-only";
import { generateText, experimental_transcribe as transcribe } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { prisma } from "./prisma";
import { isStorageConfigured, presignDownload } from "./storage";

/**
 * AI note-taker (post-call).
 *
 * When a recording finishes, we transcribe its audio with OpenAI Whisper and
 * summarise the transcript with GPT into meeting notes (overview, key points,
 * decisions, action items). The finished MP4 already lives in the private R2
 * bucket (LiveKit egress → R2), so this reuses that file — nothing new is
 * captured during the call.
 *
 * Configure with:
 *   OPENAI_API_KEY   — your OpenAI key (used for both transcription and summary)
 * plus the existing R2_* vars that store the recording.
 *
 * Whisper accepts files up to 25 MB. A composite video recording can exceed
 * that quickly, so oversized files fail with a clear message rather than a
 * confusing API error — see MAX_TRANSCRIBE_BYTES.
 */

// OpenAI's transcription endpoint hard-limits uploads to 25 MB.
const MAX_TRANSCRIBE_BYTES = 25 * 1024 * 1024;

const TRANSCRIBE_MODEL = "whisper-1";
const SUMMARY_MODEL = "gpt-4o";

/** True when both OpenAI and R2 storage are configured. */
export function isNoteTakerConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY) && isStorageConfigured();
}

function openaiClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
  return createOpenAI({ apiKey });
}

/**
 * Ensure a notes row exists for a recording, in PENDING state, without running
 * generation. Called when a recording reaches READY so the UI can show "notes
 * pending" and offer to generate them. No-op if a row already exists.
 */
export async function ensureNotesForRecording(recordingId: string): Promise<void> {
  const existing = await prisma.meetingNotes.findUnique({
    where: { recordingId },
    select: { id: true },
  });
  if (existing) return;
  await prisma.meetingNotes.create({
    data: { recordingId, status: "PENDING" },
  });
}

export type NotesResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Transcribe + summarise a finished recording into meeting notes. Idempotent
 * and safe to re-run (regenerate). Best-effort: on failure the notes row is
 * marked FAILED with a user-facing reason and `{ ok: false }` is returned
 * rather than throwing, so callers (webhook, API route) don't crash.
 */
export async function generateMeetingNotes(recordingId: string): Promise<NotesResult> {
  if (!isNoteTakerConfigured()) {
    return { ok: false, error: "Note-taker isn't configured (set OPENAI_API_KEY)." };
  }

  const recording = await prisma.recording.findUnique({
    where: { id: recordingId },
    select: { status: true, storageKey: true, durationSec: true },
  });
  if (!recording) return { ok: false, error: "Recording not found." };
  if (recording.status !== "READY" || !recording.storageKey) {
    return { ok: false, error: "Recording isn't ready yet." };
  }

  // Claim the row as PROCESSING up-front so a second trigger doesn't double-run.
  await prisma.meetingNotes.upsert({
    where: { recordingId },
    create: { recordingId, status: "PROCESSING" },
    update: { status: "PROCESSING", error: null },
  });

  try {
    // Pull the recording bytes from the private bucket via a short-lived URL.
    const url = await presignDownload(recording.storageKey);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not read the recording (${res.status}).`);
    const audio = new Uint8Array(await res.arrayBuffer());

    if (audio.byteLength > MAX_TRANSCRIBE_BYTES) {
      const mb = (audio.byteLength / 1024 / 1024).toFixed(0);
      throw new Error(
        `Recording is ${mb} MB — over the 25 MB transcription limit. Shorter meetings transcribe automatically; audio-only recording is the fix for long calls.`
      );
    }

    const openai = openaiClient();

    // 1) Speech-to-text.
    const { text: transcript } = await transcribe({
      model: openai.transcription(TRANSCRIBE_MODEL),
      audio,
    });
    if (!transcript.trim()) {
      throw new Error("No speech was detected in this recording.");
    }

    // 2) Summarise into structured, readable notes.
    const { text: summary } = await generateText({
      model: openai(SUMMARY_MODEL),
      system:
        "You are a meeting notes assistant. Given a raw call transcript, write concise, accurate notes. " +
        "Never invent facts not present in the transcript. Output GitHub-flavored Markdown with these sections, " +
        "each as a `##` heading, omitting a section only if it genuinely has no content: " +
        "Summary (2-4 sentences), Key Points (bullets), Decisions (bullets), Action Items (bullets, prefix each " +
        "with the owner in **bold** when a name is clearly stated, otherwise start with 'Unassigned').",
      prompt: `Transcript:\n\n${transcript}`,
    });

    await prisma.meetingNotes.update({
      where: { recordingId },
      data: {
        status: "READY",
        transcript,
        summary,
        model: `${TRANSCRIBE_MODEL} + ${SUMMARY_MODEL}`,
        error: null,
      },
    });
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Note generation failed.";
    await prisma.meetingNotes.update({
      where: { recordingId },
      data: { status: "FAILED", error },
    });
    return { ok: false, error };
  }
}

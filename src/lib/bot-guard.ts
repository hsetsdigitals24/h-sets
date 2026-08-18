/**
 * Zero-dependency anti-bot signals for public forms.
 *
 * Two cheap, invisible checks that stop the overwhelming majority of automated
 * spam without any external service, CAPTCHA, or user friction:
 *
 *  1. Honeypot — a hidden field that real users never see or fill. Bots that
 *     blindly populate every input give themselves away.
 *  2. Timing — humans take a moment to read and fill a form; a submission that
 *     arrives within a couple of seconds of the form rendering is almost
 *     certainly scripted. The client sends *elapsed* time (not a wall-clock
 *     timestamp), so there's no client/server clock-skew to cause false flags.
 *
 * Both checks are best-effort and backward compatible: a field that isn't
 * present is simply not checked, so forms can adopt them incrementally.
 */

/** Hidden honeypot input name. Looks plausible so naive bots fill it. */
export const HONEYPOT_FIELD = "company_website";
/** Elapsed-ms-since-render field name. */
export const ELAPSED_FIELD = "form_fill_ms";
/** Submissions faster than this after render are treated as automated. */
export const MIN_FILL_MS = 2500;

export type BotVerdict = { ok: true } | { ok: false; reason: "honeypot" | "too-fast" };

/**
 * Evaluate anti-bot signals from a submitted payload. `read` returns the raw
 * string value for a field name — works for a JSON object or a FormData
 * (`(f) => formData.get(f)`).
 */
export function checkBotSignals(
  read: (field: string) => string | null | undefined
): BotVerdict {
  const honeypot = read(HONEYPOT_FIELD);
  if (honeypot != null && honeypot.trim() !== "") {
    return { ok: false, reason: "honeypot" };
  }

  const elapsedRaw = read(ELAPSED_FIELD);
  if (elapsedRaw != null && elapsedRaw !== "") {
    const elapsed = Number(elapsedRaw);
    // A finite value below the threshold (including a forged negative) is a bot.
    if (Number.isFinite(elapsed) && elapsed < MIN_FILL_MS) {
      return { ok: false, reason: "too-fast" };
    }
  }

  return { ok: true };
}

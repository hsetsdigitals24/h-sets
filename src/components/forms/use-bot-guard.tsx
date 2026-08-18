"use client";

import * as React from "react";
import { HONEYPOT_FIELD, ELAPSED_FIELD } from "@/lib/bot-guard";

/**
 * Adds invisible anti-bot fields to a public form (see {@link checkBotSignals}).
 *
 * Usage:
 * ```tsx
 * const bot = useBotGuard();
 * // inside the <form>:  {bot.fields}
 * // when submitting:    submitForm("contact", { ...values, ...bot.values() })
 * ```
 *
 * The honeypot input is visually hidden and removed from the tab order, so real
 * users never touch it. `values()` also reports how long the form was on screen
 * before submit, measured entirely on the client (no clock-skew).
 */
export function useBotGuard() {
  const honeypotRef = React.useRef<HTMLInputElement>(null);
  // Render time, captured once (lazy init so it isn't recomputed each render).
  const [renderedAt] = React.useState(() => Date.now());

  const fields = (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
        border: 0,
        padding: 0,
        margin: -1,
      }}
    >
      {/* Honeypot — a real-looking field humans never see. Must stay blank. */}
      <label>
        Company website
        <input
          ref={honeypotRef}
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
    </div>
  );

  const values = React.useCallback(
    (): Record<string, string> => ({
      [HONEYPOT_FIELD]: honeypotRef.current?.value ?? "",
      [ELAPSED_FIELD]: String(Date.now() - renderedAt),
    }),
    [renderedAt]
  );

  return { fields, values };
}

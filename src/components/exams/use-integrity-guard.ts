"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { logExamEvent } from "@/app/(student)/account/exams/actions";

export type IntegrityConfig = {
  requireFullscreen: boolean;
  trackFocus: boolean;
  restrictCopyPaste: boolean;
  /** 0 = no auto-submit; N = auto-submit after N flagged events. */
  maxViolations: number;
  /** Violations already recorded server-side for this attempt (survives reload). */
  violationCount: number;
};

type EventType = "visibility_hidden" | "blur" | "fullscreen_exit" | "copy" | "paste" | "contextmenu";

/**
 * Wires up client-side integrity signals for an in-progress attempt. Each flagged
 * event is reported to the server (the source of truth for `maxViolations`); when
 * the server says the threshold is reached, `onAutoSubmit` fires so the attempt is
 * graded and the student is routed to results. Everything degrades gracefully
 * where the browser disallows it (e.g. fullscreen on mobile Safari).
 */
export function useIntegrityGuard({
  attemptId,
  config,
  onAutoSubmit,
  isActive,
}: {
  attemptId: string;
  config: IntegrityConfig;
  onAutoSubmit: () => void;
  /** Called on each event; return false once the attempt is submitting so late events are ignored. */
  isActive: () => boolean;
}) {
  const enteredFullscreen = useRef(false);
  // Coalesce focus-loss events: a single tab switch can fire both blur and
  // visibilitychange — count it once.
  const lastFocusFlag = useRef(0);

  const flag = useCallback(
    async (type: EventType, remainingMsg = true) => {
      if (!isActive()) return;
      const res = await logExamEvent(attemptId, type).catch(() => null);
      if (!res) return;
      if (res.autoClosed) {
        toast.error("Exam auto-submitted — too many integrity flags.");
        onAutoSubmit();
        return;
      }
      if (remainingMsg && config.maxViolations > 0 && res.violationCount != null) {
        const left = config.maxViolations - res.violationCount;
        toast.warning(
          `Leaving the exam is recorded. ${left} more ${left === 1 ? "time" : "times"} will auto-submit.`
        );
      } else if (remainingMsg) {
        toast.warning("This action was recorded by the exam.");
      }
    },
    [attemptId, config.maxViolations, onAutoSubmit, isActive]
  );

  const flagFocus = useCallback(
    (type: "visibility_hidden" | "blur") => {
      const now = Date.now();
      if (now - lastFocusFlag.current < 1000) return; // dedupe blur+visibility
      lastFocusFlag.current = now;
      void flag(type);
    },
    [flag]
  );

  // Focus tracking: tab switches and window blur.
  useEffect(() => {
    if (!config.trackFocus) return;
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flagFocus("visibility_hidden");
    };
    const onBlur = () => flagFocus("blur");
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, [config.trackFocus, flagFocus]);

  // Fullscreen enforcement: request on mount (and retry on first interaction, as
  // browsers often need a user gesture); flag exits only once we've entered.
  useEffect(() => {
    if (!config.requireFullscreen) return;
    const el = document.documentElement;
    const request = () => {
      if (document.fullscreenElement) return;
      el.requestFullscreen?.().then(
        () => {
          enteredFullscreen.current = true;
        },
        () => {}
      );
    };
    request();
    const retry = () => request();
    window.addEventListener("pointerdown", retry, { once: true });

    const onFsChange = () => {
      if (document.fullscreenElement) {
        enteredFullscreen.current = true;
      } else if (enteredFullscreen.current) {
        void flag("fullscreen_exit");
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      window.removeEventListener("pointerdown", retry);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [config.requireFullscreen, flag]);

  // Copy / paste / context-menu restriction (deterrent + flag).
  useEffect(() => {
    if (!config.restrictCopyPaste) return;
    const block = (type: "copy" | "paste" | "contextmenu") => (e: Event) => {
      e.preventDefault();
      void flag(type, false);
    };
    const onCopy = block("copy");
    const onPaste = block("paste");
    const onContext = block("contextmenu");
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContext);
    return () => {
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContext);
    };
  }, [config.restrictCopyPaste, flag]);

  // Leave fullscreen when the attempt ends.
  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, []);

  return { exitFullscreen };
}

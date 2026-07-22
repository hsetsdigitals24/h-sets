"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { recordAttestation } from "@/app/(student)/account/exams/actions";

const DEFAULT_PLEDGE =
  "I confirm that this is my own work. I will not use unauthorised materials, " +
  "communicate with anyone, or leave this exam page while it is in progress. I " +
  "understand that switching away or exiting fullscreen is recorded and may " +
  "auto-submit my attempt.";

/**
 * Integrity honour-pledge shown before the paper when the exam requires it. On
 * agreement it records the attestation server-side and refreshes so the take
 * page renders the questions.
 */
export function ExamAttestation({
  attemptId,
  title,
  text,
}: {
  attemptId: string;
  title: string;
  text?: string | null;
}) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [pending, startTransition] = useTransition();

  function accept() {
    startTransition(async () => {
      const res = await recordAttestation(attemptId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Academic integrity</p>
        <p className="mt-4 whitespace-pre-wrap text-sm">{text?.trim() || DEFAULT_PLEDGE}</p>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-primary"
          />
          I have read and agree to the statement above.
        </label>

        <div className="mt-6 flex justify-end">
          <Button type="button" variant="gradient" disabled={!agreed || pending} onClick={accept}>
            {pending ? "Starting…" : "Agree & start"}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startExamAttempt } from "./actions";

/** Starts (or resumes) an attempt, then navigates to the exam runner. */
export function StartExamButton({ examId, resume }: { examId: string; resume?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const res = await startExamAttempt(examId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      router.push(`/account/exams/${examId}/take`);
    });
  }

  return (
    <Button type="button" variant="gradient" disabled={pending} onClick={onClick}>
      {pending ? "Starting…" : resume ? "Resume exam" : "Start exam"}
    </Button>
  );
}

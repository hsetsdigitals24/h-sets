"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminForgotPasswordAction, type AdminMessageState } from "../login/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Sending…" : "Send reset link"}
    </Button>
  );
}

export default function AdminForgotPasswordPage() {
  const [state, formAction] = useActionState<AdminMessageState, FormData>(
    adminForgotPasswordAction,
    {}
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="mb-6 text-center">
          <div className="text-xl font-bold tracking-tight">
            H-SETS <span className="text-primary">Admin</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send a password reset link.
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          {state.message && (
            <p className="text-sm text-muted-foreground" role="status">
              {state.message}
            </p>
          )}
          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/admin/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

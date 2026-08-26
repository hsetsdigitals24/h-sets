import { BackLink } from "@/components/ui/back-link";
import { ChangePasswordForm } from "./change-password-form";

export const metadata = { title: "Security" };
export const dynamic = "force-dynamic";

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/account" label="Back to dashboard" />
      <h1 className="text-2xl font-bold tracking-tight">Security</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Change your password. If an admin set up your account, replace the default password here.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}

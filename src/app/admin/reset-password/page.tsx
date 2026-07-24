import Link from "next/link";
import { AdminResetForm } from "./reset-form";

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="mb-6 text-center">
          <div className="text-xl font-bold tracking-tight">
            H-SETS <span className="text-primary">Admin</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Choose a new password.</p>
        </div>

        {token && email ? (
          <AdminResetForm token={token} email={email} />
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-destructive" role="alert">
              This reset link is invalid or has expired.
            </p>
            <p className="text-sm text-muted-foreground">
              <Link href="/admin/forgot-password" className="text-primary hover:underline">
                Request a new link
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

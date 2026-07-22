import Link from "next/link";
import { ResetForm } from "./reset-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string }>;
}) {
  const { token, email } = await searchParams;

  if (!token || !email) {
    return (
      <div className="text-center">
        <h1 className="text-lg font-semibold tracking-tight">Invalid reset link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This password reset link is missing information or is malformed.
        </p>
        <p className="mt-6 text-sm">
          <Link href="/forgot-password" className="text-primary hover:underline">
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  return <ResetForm token={token} email={email} />;
}

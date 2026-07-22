import { auth } from "@/lib/auth";
import { BackLink } from "@/components/ui/back-link";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  const user = session!.user;

  return (
    <div className="mx-auto max-w-2xl">
      <BackLink href="/account" label="Back to dashboard" />
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your account details.</p>

      <dl className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <dt className="text-sm text-muted-foreground">Name</dt>
          <dd className="text-sm font-medium">{user.name || "—"}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd className="text-sm font-medium">{user.email}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <dt className="text-sm text-muted-foreground">Account type</dt>
          <dd className="text-sm font-medium">Student</dd>
        </div>
      </dl>
    </div>
  );
}

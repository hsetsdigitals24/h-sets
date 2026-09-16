import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/rbac";
import { PageHeading } from "@/components/admin/page-heading";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "My profile" };
export const dynamic = "force-dynamic";

/**
 * Every staff member's own profile. Deliberately not an RBAC-gated section:
 * it edits only the signed-in member's own details, so it is available to any
 * role that can reach the admin area. Role and page access stay under
 * /admin/users, which is super-admin only.
 */
export default async function ProfilePage() {
  const current = await requireUser();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: current.id },
    select: {
      name: true,
      email: true,
      image: true,
      jobTitle: true,
      phone: true,
      bio: true,
      role: true,
    },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="My profile"
        description="Your details and profile picture across the platform."
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-2xl border border-border bg-card px-5 py-4 text-sm shadow-soft">
        <span className="text-muted-foreground">
          Email <span className="font-medium text-foreground">{user.email}</span>
        </span>
        <span className="text-muted-foreground">
          Role <span className="font-medium text-foreground">{ROLE_LABELS[user.role]}</span>
        </span>
        <Link
          href="/admin/forgot-password"
          className="ml-auto font-medium text-primary hover:underline"
        >
          Change password
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <ProfileForm profile={user} />
      </div>
    </div>
  );
}

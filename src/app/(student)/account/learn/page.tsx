import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cohortProgress } from "@/lib/lms";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My Learning" };
export const dynamic = "force-dynamic";

export default async function MyLearningPage() {
  const session = await auth();
  const user = session!.user;

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id, status: { not: "withdrawn" } },
    include: { cohort: { include: { programme: { select: { name: true } } } } },
    orderBy: { enrolledAt: "desc" },
  });

  const rows = await Promise.all(
    enrollments.map(async (e) => ({ e, progress: await cohortProgress(user.id, e.cohortId) }))
  );

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/account" label="Back to dashboard" />
      <h1 className="text-2xl font-bold tracking-tight">My Learning</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your enrolled cohorts and course materials.</p>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          You have no active cohorts yet.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map(({ e, progress }) => (
            <div key={e.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div>
                <h2 className="font-semibold">{e.cohort.programme.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {progress.completed}/{progress.total} lessons complete · {progress.percent}%
                </p>
              </div>
              <Button asChild variant="gradient" size="sm">
                <Link href={`/account/learn/${e.cohortId}`}>
                  <BookOpen className="size-4" /> Open
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

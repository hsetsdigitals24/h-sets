import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { CohortForm } from "../cohort-form";
import { updateCohort } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditCohortPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("cohorts");
  const { id } = await params;
  const [cohort, programmes, instructors] = await Promise.all([
    prisma.cohort.findUnique({
      where: { id },
      include: {
        instructors: { select: { id: true } },
        programme: true,
      },
    }),
    prisma.programme.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.instructor.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, title: true },
    }),
  ]);
  if (!cohort) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/cohorts", label: "Back to cohorts" }} title="Edit cohort" description={cohort.programme.name} />
      <CohortForm
        action={updateCohort}
        cohort={cohort}
        programmes={programmes}
        instructors={instructors}
      />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { CohortForm } from "../cohort-form";
import { createCohort } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCohortPage() {
  await requireSection("cohorts");
  const [programmes, instructors] = await Promise.all([
    prisma.programme.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.instructor.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, title: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/cohorts", label: "Back to cohorts" }} title="New cohort" description="Reuse an existing programme or create a new one for this intake." />
      <CohortForm action={createCohort} programmes={programmes} instructors={instructors} />
    </div>
  );
}

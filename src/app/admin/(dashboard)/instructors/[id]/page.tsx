import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { InstructorForm } from "../instructor-form";
import { updateInstructor } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditInstructorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("instructors");
  const { id } = await params;
  const instructor = await prisma.instructor.findUnique({
    where: { id },
    include: { user: { select: { email: true } } },
  });
  if (!instructor) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/instructors", label: "Back to instructors" }} title="Edit instructor" description={`${instructor.name} · ${instructor.title}`} />
      <InstructorForm action={updateInstructor} instructor={instructor} email={instructor.user?.email} />
    </div>
  );
}

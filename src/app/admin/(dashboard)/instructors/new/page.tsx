import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { InstructorForm } from "../instructor-form";
import { createInstructor } from "../actions";

export default async function NewInstructorPage() {
  await requireSection("instructors");
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/instructors", label: "Back to instructors" }} title="New instructor" />
      <InstructorForm action={createInstructor} />
    </div>
  );
}

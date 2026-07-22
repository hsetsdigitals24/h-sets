import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { JobForm } from "../job-form";
import { createJob } from "../actions";

export default async function NewJobPage() {
  await requireSection("jobs");
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/jobs", label: "Back to jobs" }} title="New job" description="Add a listing to the job board." />
      <JobForm action={createJob} />
    </div>
  );
}

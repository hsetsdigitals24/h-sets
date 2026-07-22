import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { JobForm } from "../job-form";
import { updateJob } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("jobs");
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/jobs", label: "Back to jobs" }} title="Edit job" description={job.title} />
      <JobForm action={updateJob} job={job} />
    </div>
  );
}

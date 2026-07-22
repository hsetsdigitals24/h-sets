import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { ResourceForm } from "../resource-form";
import { updateResource } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("resources");
  const { id } = await params;
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/resources", label: "Back to resources" }} title="Edit resource" description={resource.title} />
      <ResourceForm action={updateResource} resource={resource} />
    </div>
  );
}

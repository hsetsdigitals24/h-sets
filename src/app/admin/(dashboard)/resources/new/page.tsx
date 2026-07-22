import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { ResourceForm } from "../resource-form";
import { createResource } from "../actions";

export default async function NewResourcePage() {
  await requireSection("resources");
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/resources", label: "Back to resources" }} title="New resource" />
      <ResourceForm action={createResource} />
    </div>
  );
}

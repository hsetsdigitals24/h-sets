import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { InsightForm } from "../insight-form";
import { createInsight } from "../actions";

export default async function NewInsightPage() {
  await requireSection("insights");
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/insights", label: "Back to insights" }} title="New insight" description="Publish a new blog post." />
      <InsightForm action={createInsight} />
    </div>
  );
}

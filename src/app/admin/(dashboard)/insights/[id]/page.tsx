import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { InsightForm } from "../insight-form";
import { updateInsight } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditInsightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("insights");
  const { id } = await params;
  const insight = await prisma.insight.findUnique({ where: { id } });
  if (!insight) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/insights", label: "Back to insights" }} title="Edit insight" description={insight.title} />
      <InsightForm action={updateInsight} insight={insight} />
    </div>
  );
}

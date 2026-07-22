import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { PortfolioForm } from "../portfolio-form";
import { updatePortfolioItem } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPortfolioItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("portfolio");
  const { id } = await params;
  const item = await prisma.portfolio.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/portfolio", label: "Back to portfolio" }} title="Edit portfolio item" description={item.title} />
      <PortfolioForm action={updatePortfolioItem} item={item} />
    </div>
  );
}

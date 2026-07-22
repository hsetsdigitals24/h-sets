import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { PortfolioForm } from "../portfolio-form";
import { createPortfolioItem } from "../actions";

export default async function NewPortfolioItemPage() {
  await requireSection("portfolio");
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        back={{ href: "/admin/portfolio", label: "Back to portfolio" }} title="New portfolio item" />
      <PortfolioForm action={createPortfolioItem} />
    </div>
  );
}

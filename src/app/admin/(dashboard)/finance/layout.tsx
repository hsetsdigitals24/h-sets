import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { FinanceTabs } from "./finance-tabs";

export const dynamic = "force-dynamic";

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole finance area once, here. Sub-pages also guard themselves
  // (defence in depth) but this keeps the redirect consistent for every tab.
  await requireSection("finance");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Finance"
        description="Revenue, expenditure, and budget planning."
      />
      <FinanceTabs />
      {children}
    </div>
  );
}

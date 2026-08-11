import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { ResourcesGrid } from "@/components/sections/resources-grid";
import { CtaStrip } from "@/components/common/cta-strip";
import { BreadcrumbSchema } from "@/lib/seo";
import { getResources } from "@/lib/content";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Resource Hub",
  description:
    "Free e-books, templates, checklists, playbooks and reports to help you grow your business and skills — from H-SETS.",
};

export const revalidate = 3600; // ISR: rebuilt hourly; admin edits trigger instant on-demand revalidatePath

/**
 * Category filters. Each maps a URL `?type=` value to the resource `type`
 * labels it includes, so footer/nav links can deep-link to a filtered view.
 */
const FILTERS = [
  { key: "all", label: "All", types: null as string[] | null },
  { key: "guides", label: "E-Books & Guides", types: ["E-Book", "Playbook"] },
  { key: "templates", label: "Templates & Checklists", types: ["Template", "Checklist"] },
  { key: "reports", label: "Industry Reports", types: ["Industry Report"] },
];

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const active = FILTERS.find((f) => f.key === type) ?? FILTERS[0];

  const all = await getResources();
  const resources = active.types
    ? all.filter((r) => active.types!.includes(r.type))
    : all;

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Resources", href: "/resources" },
        ]}
      />
      <PageHero
        eyebrow="Resource Hub"
        title={<>Free tools to <span className="text-gradient">grow faster</span></>}
        description="Practical e-books, templates, checklists and reports — created by our team and free to download."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Resources", href: "/resources" },
        ]}
      />
      <Section>
        {/* Category filters */}
        <div className="mb-10 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/resources" : `/resources?type=${f.key}`}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                f.key === active.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {resources.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground">
            Nothing here yet — new {active.label.toLowerCase()} are on the way.{" "}
            <Link href="/resources" className="text-primary hover:underline">
              Browse all resources
            </Link>
            .
          </p>
        ) : (
          <ResourcesGrid resources={resources} />
        )}
      </Section>
      <CtaStrip
        title="Need something more tailored?"
        description="Book a free consultation and we'll point you to exactly what your business needs."
        secondary={{ label: "Explore services", href: "/services" }}
      />
    </>
  );
}

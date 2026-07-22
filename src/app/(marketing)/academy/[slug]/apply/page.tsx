import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProgramme } from "@/lib/content";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { BreadcrumbSchema } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { ApplyForm } from "./apply-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProgramme(slug);
  if (!p) return {};
  return { title: `Apply — ${p.name}`, description: `Apply for the ${p.name} programme.` };
}

export default async function ApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cohort?: string }>;
}) {
  const { slug } = await params;
  const { cohort: cohortId } = await searchParams;
  const programme = await getProgramme(slug);
  if (!programme) notFound();

  // Only active cohorts still taking applications: not Full and not yet ended.
  const today = new Date().toISOString().slice(0, 10);
  const openCohorts = programme.cohorts.filter(
    (c) => c.status !== "Full" && c.endDate >= today,
  );

  const options = openCohorts.map((c) => ({
    id: c.id,
    label: `${formatDate(c.startDate)} · ${c.format} (${c.seatsLeft} seats left)`,
  }));

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Academy", href: "/academy" },
    { name: programme.name, href: `/academy/${programme.slug}` },
    { name: "Apply", href: `/academy/${programme.slug}/apply` },
  ];

  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <PageHero
        eyebrow={`Academy · ${programme.category}`}
        title={`Apply — ${programme.name}`}
        description="Submit your application below. Our admissions team reviews every application and will email you with the outcome and next steps."
      />

      <Section>
        <div className="mx-auto max-w-2xl">
          {options.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              There are no cohorts currently taking applications for this programme. Check back
              soon or{" "}
              <a href="/contact#consultation" className="text-primary hover:underline">
                book a guidance call
              </a>
              .
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <ApplyForm cohorts={options} defaultCohortId={cohortId} />
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

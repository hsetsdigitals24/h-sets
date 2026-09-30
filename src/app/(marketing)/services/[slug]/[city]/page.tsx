import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { serviceLocations, getServiceLocation } from "@/data/service-locations";
import { getLocation } from "@/data/locations";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { FaqSection } from "@/components/common/faq";
import { CtaStrip } from "@/components/common/cta-strip";
import { Button } from "@/components/ui/button";
import {
  BreadcrumbSchema,
  FaqSchema,
  LocationBusinessSchema,
  ServiceSchema,
} from "@/lib/seo";

/**
 * Only hand-authored service × city pairs get a route. An unlisted combination
 * 404s on purpose rather than rendering a templated page — thin programmatic
 * pages cost more in crawl quality than they earn in coverage.
 */
export function generateStaticParams() {
  return serviceLocations.map((sl) => ({ slug: sl.service, city: sl.city }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}): Promise<Metadata> {
  const { slug, city } = await params;
  const sl = getServiceLocation(slug, city);
  if (!sl) return {};
  return buildMetadata({
    title: sl.metaTitle,
    description: sl.metaDescription,
    path: `/services/${slug}/${city}`,
    keywords: sl.keywords,
  });
}

export default async function ServiceLocationPage({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city } = await params;
  const sl = getServiceLocation(slug, city);
  if (!sl) notFound();

  const loc = getLocation(city);
  const path = `/services/${slug}/${city}`;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: sl.serviceLabel, href: `/services/${slug}` },
    { name: sl.cityLabel, href: path },
  ];

  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <ServiceSchema
        name={`${sl.serviceLabel} in ${sl.cityLabel}`}
        description={sl.metaDescription}
        url={path}
        areaServed={[sl.cityLabel, sl.regionLabel, "Nigeria"]}
      />
      <LocationBusinessSchema
        city={sl.cityLabel}
        region={sl.regionLabel}
        path={path}
        description={sl.metaDescription}
        hasAddress={Boolean(loc?.isOffice)}
      />
      <FaqSchema faqs={sl.faqs} />

      <PageHero
        eyebrow={`${sl.serviceLabel} · ${sl.cityLabel}`}
        title={sl.h1}
        description={sl.intro}
        breadcrumbs={crumbs}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="gradient" size="lg">
            <Link href="/contact#consultation">
              Get a free consultation
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outlineLight" size="lg">
            <Link href={`/services/${slug}`}>
              All {sl.serviceLabel.toLowerCase()} services
            </Link>
          </Button>
        </div>
      </PageHero>

      {/* Local proof strip */}
      <Section className="border-b border-border bg-secondary/40 !py-12">
        <RevealGroup stagger={0.06} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sl.highlights.map((h) => (
            <RevealItem key={h.title}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-gradient text-white">
                  <Check className="size-3" />
                </span>
                <div>
                  <p className="font-semibold">{h.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{h.description}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section>
        <div className="mx-auto max-w-3xl">
          {sl.sections.map((sec) => (
            <Reveal key={sec.heading} className="mt-12 first:mt-0">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {sec.heading}
              </h2>
              {sec.body.map((p, i) => (
                <p key={i} className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </Reveal>
          ))}
        </div>
      </Section>

      <FaqSection faqs={sl.faqs} />

      {/* Links back to the parent service and city pages so the cluster is
          crawlable in both directions rather than being an orphan leaf. */}
      <Section>
        <SectionHeading eyebrow="Keep exploring" title="Related pages" />
        <RevealGroup stagger={0.08} className="mt-12 grid gap-5 sm:grid-cols-2">
          <RevealItem>
            <Link
              href={`/services/${slug}`}
              className="group block h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40"
            >
              <h3 className="text-lg font-semibold group-hover:text-primary">
                {sl.serviceLabel} — nationwide
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The full {sl.serviceLabel.toLowerCase()} service, how we work and what it
                includes.
              </p>
            </Link>
          </RevealItem>
          {loc && (
            <RevealItem>
              <Link
                href={`/locations/${loc.slug}`}
                className="group block h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <h3 className="text-lg font-semibold group-hover:text-primary">
                  Everything we do in {loc.city}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{loc.intro}</p>
              </Link>
            </RevealItem>
          )}
        </RevealGroup>
      </Section>

      <CtaStrip
        title={`Need ${sl.serviceLabel.toLowerCase()} in ${sl.cityLabel}?`}
        description="Book a free consultation — in person at our office, or over a call."
        secondary={{ label: `All ${sl.serviceLabel.toLowerCase()}`, href: `/services/${slug}` }}
      />
    </>
  );
}

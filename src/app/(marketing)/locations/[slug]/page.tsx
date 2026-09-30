import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Mail, Clock } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { locations, getLocation } from "@/data/locations";
import { site, location as office, fullAddress } from "@/lib/site";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { FaqSection } from "@/components/common/faq";
import { CtaStrip } from "@/components/common/cta-strip";
import { Button } from "@/components/ui/button";
import { BreadcrumbSchema, FaqSchema, LocationBusinessSchema } from "@/lib/seo";

export function generateStaticParams() {
  return locations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loc = getLocation(slug);
  if (!loc) return {};
  return buildMetadata({
    title: loc.metaTitle,
    description: loc.metaDescription,
    path: `/locations/${loc.slug}`,
    keywords: loc.keywords,
  });
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loc = getLocation(slug);
  if (!loc) notFound();

  const path = `/locations/${loc.slug}`;
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Locations", href: "/locations" },
    { name: loc.city, href: path },
  ];
  const nearby = loc.nearby
    .map((s) => getLocation(s))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <LocationBusinessSchema
        city={loc.city}
        region={loc.region}
        path={path}
        description={loc.metaDescription}
        hasAddress={loc.isOffice}
      />
      <FaqSchema faqs={loc.faqs} />

      <PageHero
        eyebrow={`${loc.city} · ${loc.region}`}
        title={loc.h1}
        description={loc.intro}
        breadcrumbs={crumbs}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="gradient" size="lg">
            <Link href="/contact#consultation">
              Book a free consultation
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outlineLight" size="lg">
            <Link href="/portfolio">See our work</Link>
          </Button>
        </div>
      </PageHero>

      {/* NAP block. Only the staffed office states a street address — the other
          location pages show the office they are served from instead, so the
          on-page details can never contradict the schema or the GBP listing. */}
      <Section className="border-b border-border bg-secondary/40 !py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">
                {loc.isOffice ? "Our office" : "Served from"}
              </p>
              <address className="mt-1 text-sm not-italic text-muted-foreground">
                {fullAddress}
              </address>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">Call us</p>
              <a
                href={`tel:${site.phone.replace(/\s+/g, "").split("/")[0]}`}
                className="mt-1 block text-sm text-muted-foreground hover:text-primary"
              >
                {site.phone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">Email</p>
              <a
                href={`mailto:${site.email}`}
                className="mt-1 block text-sm text-muted-foreground hover:text-primary"
              >
                {site.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold">Opening hours</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Monday–Friday, 9:00–17:00 WAT
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Long-form body — the differentiated content each location page needs
          to stand on its own rather than read as a templated duplicate. */}
      <Section>
        <div className="mx-auto max-w-3xl">
          {loc.sections.map((sec) => (
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

      {/* Services, framed locally and linking back to the canonical service pages. */}
      <Section className="bg-secondary/40">
        <SectionHeading
          eyebrow="What we do"
          title={`Our services in ${loc.city}`}
          description={`Every engagement below is delivered to businesses in ${loc.city} and ${loc.region}.`}
        />
        <RevealGroup stagger={0.06} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loc.services.map((s) => (
            <RevealItem key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="group block h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <h3 className="text-lg font-semibold group-hover:text-primary">
                  {s.label} in {loc.city}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Learn more
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Map — office page only. */}
      {loc.isOffice && (
        <Section>
          <SectionHeading
            eyebrow="Find us"
            title={`The H-SETS office in ${loc.city}`}
            description="Visitors are welcome — call ahead so the right person is free."
          />
          <Reveal className="mt-12 overflow-hidden rounded-3xl border border-border shadow-soft">
            <iframe
              title={`Map showing the H-SETS office in ${loc.city}, ${loc.region}`}
              src={`https://www.google.com/maps?q=${office.latitude},${office.longitude}&z=15&output=embed`}
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block border-0"
            />
          </Reveal>
        </Section>
      )}

      <FaqSection faqs={loc.faqs} />

      {nearby.length > 0 && (
        <Section className="bg-secondary/40">
          <SectionHeading eyebrow="Nearby" title="Other locations we serve" />
          <RevealGroup stagger={0.08} className="mt-12 grid gap-5 sm:grid-cols-2">
            {nearby.map((n) => (
              <RevealItem key={n.slug}>
                <Link
                  href={`/locations/${n.slug}`}
                  className="group block h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40"
                >
                  <h3 className="text-lg font-semibold group-hover:text-primary">{n.h1}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{n.intro}</p>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      )}

      <CtaStrip
        title={`Let's talk about your project in ${loc.city}`}
        description="Book a free consultation — in person if you're nearby, or over a call."
        secondary={{ label: "View all services", href: "/services" }}
      />
    </>
  );
}

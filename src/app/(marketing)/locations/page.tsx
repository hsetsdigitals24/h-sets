import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { buildMetadata } from "@/lib/metadata";
import { locations } from "@/data/locations";
import { fullAddress } from "@/lib/site";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { RevealGroup, RevealItem } from "@/components/common/reveal";
import { CtaStrip } from "@/components/common/cta-strip";
import { BreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Where We Work — Ilorin, Kwara & Lagos",
  description:
    "H-SETS is based in Ilorin, Kwara State and delivers software, AI and digital marketing to businesses across Kwara, Lagos and the rest of Nigeria.",
  path: "/locations",
});

export default function LocationsPage() {
  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Locations", href: "/locations" },
  ];

  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <PageHero
        eyebrow="Locations"
        title={<>Where we <span className="text-gradient">work</span></>}
        description="Based in Ilorin, Kwara State — delivering across Nigeria. Pick your market to see what we do there."
        breadcrumbs={crumbs}
      />

      <Section>
        <SectionHeading
          eyebrow="Our markets"
          title="Local teams, local search, local accountability"
          description="Each page below is written for that market — not the same page with a city name swapped in."
        />
        <RevealGroup stagger={0.08} className="mt-12 grid gap-6 md:grid-cols-3">
          {locations.map((l) => (
            <RevealItem key={l.slug} className="h-full">
              <Link
                href={`/locations/${l.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                  <MapPin className="size-5" />
                </span>
                <h2 className="mt-5 text-xl font-semibold group-hover:text-primary">
                  {l.city}
                </h2>
                <p className="text-sm text-primary">{l.region}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {l.intro}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {l.isOffice ? "Visit our office" : "See what we do here"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>

        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-muted-foreground">
          Head office: <span className="font-medium text-foreground">{fullAddress}</span>
        </p>
      </Section>

      <CtaStrip />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { getPublishedInsights } from "@/lib/content";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { InsightCard } from "@/components/cards/insight-card";
import { CtaStrip } from "@/components/common/cta-strip";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";
import { BreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Practical perspectives on technology, AI, design and building a career in tech — from the H-SETS team.",
};

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const insights = await getPublishedInsights();
  const [featured, ...rest] = insights;
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Insights", href: "/insights" },
        ]}
      />
      <PageHero
        eyebrow="Insights"
        title={<>Ideas worth <span className="text-gradient">your time</span></>}
        description="Practical perspectives on technology, AI and building a career in tech."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Insights", href: "/insights" },
        ]}
      />

      {/* Featured */}
      {featured && (
      <Section className="pb-0">
        <Reveal>
          <Link
            href={`/insights/${featured.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all hover:border-primary/40 lg:grid-cols-2"
          >
            <div className={cn("relative min-h-[240px]", featured.accent)}>
              <span className="absolute left-6 top-6">
                <Badge variant="glass">Featured · {featured.category}</Badge>
              </span>
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <h2 className="text-2xl font-bold tracking-tight transition-colors group-hover:text-primary sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{featured.author}</span>
                <span>·</span>
                <span>{formatDate(featured.date)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {featured.readMins}m
                </span>
                <ArrowUpRight className="ml-auto size-5 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>
        </Reveal>
      </Section>
      )}

      {/* Grid */}
      <Section>
        <RevealGroup stagger={0.06} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((insight) => (
            <RevealItem key={insight.slug} className="h-full">
              <InsightCard insight={insight} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <CtaStrip
        title="Want this in your inbox?"
        description="Subscribe for practical insights on technology and career growth — no spam, ever."
        primary={{ label: "Book a consultation", href: "/contact#consultation" }}
        secondary={{ label: "Explore the Academy", href: "/academy" }}
      />
    </>
  );
}

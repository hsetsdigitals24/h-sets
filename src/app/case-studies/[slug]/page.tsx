import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Quote } from "lucide-react";
import { caseStudies, getCaseStudy } from "@/data/case-studies";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { CaseStudyCard } from "@/components/cards/case-study-card";
import { CtaStrip } from "@/components/common/cta-strip";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbSchema } from "@/lib/seo";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return { title: study.title, description: study.summary };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const related = study.related
    .map((s) => getCaseStudy(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Portfolio", href: "/portfolio" },
    { name: study.client, href: `/case-studies/${study.slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <PageHero
        eyebrow={`${study.industry} · ${study.service}`}
        title={study.title}
        description={study.summary}
        breadcrumbs={crumbs}
      />

      {/* Results band */}
      <Section className="py-12">
        <RevealGroup stagger={0.1} className="grid gap-5 sm:grid-cols-3">
          {study.results.map((r) => (
            <RevealItem key={r.label}>
              <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
                <p className="font-display text-4xl font-bold text-gradient sm:text-5xl">
                  {r.metric}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{r.label}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Narrative */}
      <Section className="pt-0">
        <div className="mx-auto max-w-3xl space-y-12">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight">The challenge</h2>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              {study.challenge}
            </p>
          </Reveal>
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight">Our solution</h2>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              {study.solution}
            </p>
          </Reveal>
          <Reveal>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
              Technology used
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {study.tech.map((t) => (
                <Badge key={t} variant="outline" className="px-3 py-1.5 text-sm">
                  {t}
                </Badge>
              ))}
            </div>
          </Reveal>

          {study.testimonial && (
            <Reveal>
              <figure className="relative overflow-hidden rounded-3xl bg-ink-gradient p-8 text-white">
                <Quote className="absolute right-6 top-6 size-14 text-white/10" />
                <blockquote className="relative text-xl leading-relaxed">
                  “{study.testimonial.quote}”
                </blockquote>
                <figcaption className="relative mt-5 text-sm">
                  <span className="font-semibold">{study.testimonial.name}</span>
                  <span className="block text-white/60">{study.testimonial.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          )}
        </div>
      </Section>

      {related.length > 0 && (
        <Section className="bg-secondary/40">
          <SectionHeading eyebrow="More work" title="Related case studies" />
          <RevealGroup stagger={0.08} className="mt-12 grid gap-6 md:grid-cols-2">
            {related.map((s) => (
              <RevealItem key={s.slug} className="h-full">
                <CaseStudyCard study={s} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      )}

      <CtaStrip
        title="Let's write your success story"
        description="Book a free consultation and tell us what you're trying to achieve."
        secondary={{ label: "View all work", href: "/portfolio" }}
      />
    </>
  );
}

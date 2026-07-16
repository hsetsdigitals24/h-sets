import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { insights, getInsight } from "@/data/insights";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { InsightCard } from "@/components/cards/insight-card";
import { CtaStrip } from "@/components/common/cta-strip";
import { formatDate } from "@/lib/utils";
import { ArticleSchema, BreadcrumbSchema } from "@/lib/seo";

export function generateStaticParams() {
  return insights.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) return {};
  return { title: insight.title, description: insight.excerpt };
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const insight = getInsight(slug);
  if (!insight) notFound();

  const related = insights.filter((i) => i.slug !== insight.slug).slice(0, 3);

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Insights", href: "/insights" },
    { name: insight.title, href: `/insights/${insight.slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <ArticleSchema
        title={insight.title}
        description={insight.excerpt}
        author={insight.author}
        date={insight.date}
      />

      <PageHero eyebrow={insight.category} title={insight.title} breadcrumbs={crumbs}>
        <div className="flex items-center gap-4 text-sm text-white/70">
          <span className="grid size-10 place-items-center rounded-full bg-brand-gradient font-semibold text-white">
            {insight.author.split(" ").map((n) => n[0]).join("")}
          </span>
          <span>
            <span className="block font-medium text-white">{insight.author}</span>
            <span>{insight.authorRole}</span>
          </span>
          <span className="ml-2 border-l border-white/20 pl-4">
            {formatDate(insight.date)} · {insight.readMins} min read
          </span>
        </div>
      </PageHero>

      <Section>
        <article className="mx-auto max-w-2xl">
          {insight.body.map((para, i) => (
            <Reveal key={i}>
              <p className="mb-6 text-lg leading-relaxed text-foreground/90">{para}</p>
            </Reveal>
          ))}
        </article>
      </Section>

      <Section className="bg-secondary/40">
        <SectionHeading eyebrow="Keep reading" title="Related insights" />
        <RevealGroup stagger={0.08} className="mt-12 grid gap-6 md:grid-cols-3">
          {related.map((i) => (
            <RevealItem key={i.slug} className="h-full">
              <InsightCard insight={i} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <CtaStrip />
    </>
  );
}

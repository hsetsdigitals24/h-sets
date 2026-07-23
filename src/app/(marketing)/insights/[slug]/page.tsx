import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedInsights, getInsight } from "@/lib/content";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { InsightCard } from "@/components/cards/insight-card";
import { CtaStrip } from "@/components/common/cta-strip";
import { formatDate } from "@/lib/utils";
import { ArticleSchema, BreadcrumbSchema } from "@/lib/seo";

export const revalidate = 3600; // ISR: rebuilt hourly; admin edits trigger instant on-demand revalidatePath

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const insight = await getInsight(slug);
  if (!insight) return {};
  return { title: insight.title, description: insight.excerpt };
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const insight = await getInsight(slug);
  if (!insight) notFound();

  const all = await getPublishedInsights();
  const related = all.filter((i) => i.slug !== insight.slug).slice(0, 3);

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
          <Reveal>
            <div
              className="prose prose-lg max-w-none text-foreground/90 prose-headings:text-foreground prose-a:text-primary prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: insight.body }}
            />
          </Reveal>
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

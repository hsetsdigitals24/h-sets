import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { getIndustry } from "@/lib/content";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { FaqSection } from "@/components/common/faq";
import { CtaStrip } from "@/components/common/cta-strip";
import { Button } from "@/components/ui/button";
import { BreadcrumbSchema, FaqSchema, ServiceSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await getIndustry(slug);
  if (!industry) return {};
  return { title: `${industry.name} Solutions`, description: industry.short };
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = await getIndustry(slug);
  if (!industry) notFound();

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Industries", href: "/industries" },
    { name: industry.name, href: `/industries/${industry.slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <ServiceSchema name={`${industry.name} Technology Solutions`} description={industry.short} />
      <FaqSchema faqs={industry.faqs} />

      <PageHero
        eyebrow={`Industries · ${industry.name}`}
        title={industry.hero}
        description={industry.short}
        breadcrumbs={crumbs}
      >
        <Button asChild variant="gradient" size="lg">
          <Link href="/contact#consultation">
            Discuss your project
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </PageHero>

      {/* Challenges vs solutions */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-border bg-card p-8 shadow-soft">
              <h2 className="text-xl font-bold">The challenges you face</h2>
              <ul className="mt-5 space-y-3">
                {industry.challenges.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                      <X className="size-3" />
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal direction="left">
            <div className="h-full rounded-3xl bg-ink-gradient p-8 text-white">
              <h2 className="text-xl font-bold">How H-SETS helps</h2>
              <ul className="mt-5 space-y-4">
                {industry.solutions.map((s) => (
                  <li key={s.title} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-gradient">
                      <Check className="size-3" />
                    </span>
                    <span>
                      <span className="font-semibold">{s.title}</span>
                      <span className="block text-sm text-white/70">{s.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Stat band */}
      <Section className="py-0">
        <Reveal>
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-brand-gradient px-8 py-12 text-center text-white">
            <span className="font-display text-5xl font-bold sm:text-6xl">
              {industry.stat.value}
            </span>
            <span className="max-w-md text-white/90">{industry.stat.label}</span>
          </div>
        </Reveal>
      </Section>

      {/* Use cases */}
      <Section>
        <SectionHeading eyebrow="Use cases" title={`What we build for ${industry.name.toLowerCase()}`} />
        <RevealGroup stagger={0.06} className="mt-12 grid gap-4 sm:grid-cols-2">
          {industry.useCases.map((u, i) => (
            <RevealItem key={u}>
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary font-display font-bold text-primary">
                  {i + 1}
                </span>
                <span className="font-medium">{u}</span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <FaqSection faqs={industry.faqs} />

      <CtaStrip
        title={`Let's build something for ${industry.name.toLowerCase()}`}
        description="Book a free consultation and we'll map the highest-impact opportunities for your organisation."
        secondary={{ label: "Explore services", href: "/services" }}
      />
    </>
  );
}

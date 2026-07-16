import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { services, getService } from "@/data/services";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { FaqSection } from "@/components/common/faq";
import { CtaStrip } from "@/components/common/cta-strip";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/cards/service-card";
import { BreadcrumbSchema, FaqSchema, ServiceSchema } from "@/lib/seo";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.short,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = service.related
    .map((s) => getService(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: service.name, href: `/services/${service.slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <ServiceSchema name={service.name} description={service.short} />
      <FaqSchema faqs={service.faqs} />

      <PageHero
        eyebrow={service.tagline}
        title={service.hero}
        description={service.short}
        breadcrumbs={crumbs}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="gradient" size="lg">
            <Link href="/contact#consultation">
              Get Free Consultation
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outlineLight" size="lg">
            <Link href="/portfolio">See our work</Link>
          </Button>
        </div>
      </PageHero>

      {/* Problem + outcomes */}
      <Section>
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              The problem
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Why this matters
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {service.problem}
            </p>
          </Reveal>
          <Reveal direction="left">
            <div className="rounded-3xl border border-border bg-secondary/40 p-8">
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                What you get
              </span>
              <ul className="mt-5 space-y-3">
                {service.outcomes.map((o) => (
                  <li key={o} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-gradient text-white">
                      <Check className="size-3" />
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Features */}
      <Section className="bg-secondary/40">
        <SectionHeading
          eyebrow="Capabilities"
          title={`What's included in ${service.name}`}
        />
        <RevealGroup stagger={0.08} className="mt-12 grid gap-5 sm:grid-cols-2">
          {service.features.map((f) => (
            <RevealItem key={f.title}>
              <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-muted-foreground">{f.description}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Process */}
      <Section>
        <SectionHeading eyebrow="How we work" title="A clear, proven process" />
        <RevealGroup stagger={0.1} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {service.process.map((step) => (
            <RevealItem key={step.step}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                <span className="font-display text-4xl font-bold text-gradient">
                  {step.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <FaqSection faqs={service.faqs} />

      {/* Related */}
      {related.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Keep exploring" title="Related services" />
          <RevealGroup stagger={0.08} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <RevealItem key={s.slug} className="h-full">
                <ServiceCard service={s} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      )}

      <CtaStrip
        title={`Ready to get started with ${service.name}?`}
        description="Book a free consultation and let's talk about your goals."
        secondary={{ label: "View all services", href: "/services" }}
      />
    </>
  );
}

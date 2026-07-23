import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, Sparkles, Brain, Workflow, ShieldCheck, Gauge } from "lucide-react";
import { getService } from "@/lib/content";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { ServiceCard } from "@/components/cards/service-card";
import { CtaStrip } from "@/components/common/cta-strip";
import { FaqSection } from "@/components/common/faq";
import { Button } from "@/components/ui/button";
import { BreadcrumbSchema, FaqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Solutions",
  description:
    "Practical AI for real business outcomes — automation, agents, strategy and readiness assessments from H-SETS.",
};

const capabilities = [
  { icon: Workflow, title: "AI Automation", description: "Remove repetitive manual work and reclaim hours every week." },
  { icon: Bot, title: "AI Agents", description: "Always-on agents for support, sales and internal operations." },
  { icon: Brain, title: "AI Strategy", description: "A clear, ROI-driven roadmap for where AI fits your business." },
  { icon: Gauge, title: "AI Readiness", description: "Assess your data, process and people before you invest." },
  { icon: ShieldCheck, title: "Responsible AI", description: "Guardrails, grounding and human-in-the-loop by design." },
  { icon: Sparkles, title: "Custom AI Apps", description: "Bespoke AI features built into your products and workflows." },
];

const aiFaqs = [
  { q: "Where should we start with AI?", a: "With an AI readiness assessment. We look at your data, processes and people to find the highest-ROI opportunities before building anything." },
  { q: "Will AI replace our staff?", a: "Our approach removes drudge work so your team can focus on higher-value work. We design human-in-the-loop wherever judgment matters." },
  { q: "Which AI models do you use?", a: "We select the best model per use case — including Claude — balancing accuracy, latency and cost. We're not locked to one vendor." },
  { q: "How do you prevent AI mistakes?", a: "We ground responses in your approved data using retrieval, set clear scope limits, and add escalation paths so the system asks for help when unsure." },
];

export const revalidate = 3600; // ISR: rebuilt hourly; admin edits trigger instant on-demand revalidatePath

export default async function AiSolutionsPage() {
  const aiServices = (
    await Promise.all([getService("ai-automation"), getService("ai-agents")])
  ).filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "AI Solutions", href: "/ai-solutions" },
        ]}
      />
      <FaqSchema faqs={aiFaqs} />

      <PageHero
        eyebrow="AI Solutions"
        title={<>Practical AI for <span className="text-gradient">real outcomes</span></>}
        description="Not hype — measurable results. We help you automate work, deploy agents and build AI into the heart of your business."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "AI Solutions", href: "/ai-solutions" },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="gradient" size="lg">
            <Link href="/contact#consultation">
              Book an AI consultation
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outlineLight" size="lg">
            <Link href="/resources">Try the readiness assessment</Link>
          </Button>
        </div>
      </PageHero>

      {/* Capabilities */}
      <Section>
        <SectionHeading
          eyebrow="Capabilities"
          title="How we put AI to work"
          description="From quick automation wins to full AI strategy, we meet you where you are."
        />
        <RevealGroup stagger={0.06} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <RevealItem key={c.title}>
                <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40">
                  <div className="grid size-12 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      {/* Readiness band */}
      <Section className="py-0">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-center text-white sm:p-14">
            <div className="relative mx-auto max-w-2xl">
              <h3 className="text-2xl font-bold sm:text-3xl">Is your business ready for AI?</h3>
              <p className="mt-3 text-white/90">
                Take our free AI Readiness Self-Assessment and get a tailored view of where
                AI can cut costs and unlock growth — across data, process and people.
              </p>
              <Button asChild variant="light" size="lg" className="mt-7">
                <Link href="/resources">
                  Start the assessment
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* Featured AI services */}
      <Section>
        <SectionHeading eyebrow="Services" title="Explore our AI services" />
        <RevealGroup stagger={0.08} className="mt-12 grid gap-5 sm:grid-cols-2">
          {aiServices.map((s) => (
            <RevealItem key={s.slug} className="h-full">
              <ServiceCard service={s} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <FaqSection faqs={aiFaqs} title="AI questions, answered" />

      <CtaStrip
        title="Let's find your AI opportunity"
        description="Book a free AI consultation and we'll scope the highest-impact use cases for your business."
        primary={{ label: "Book AI consultation", href: "/contact#consultation" }}
        secondary={{ label: "Explore all services", href: "/services" }}
      />
    </>
  );
}

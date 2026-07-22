import type { Metadata } from "next";
import Link from "next/link";
import { Award, Briefcase, Users, Calendar } from "lucide-react";
import { getProgrammes } from "@/lib/content";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { RevealGroup, RevealItem, Reveal } from "@/components/common/reveal";
import { ProgrammeCard } from "@/components/cards/programme-card";
import { CtaStrip } from "@/components/common/cta-strip";
import { Button } from "@/components/ui/button";
import { BreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Academy",
  description:
    "Cohort-based, instructor-led tech training from the H-SETS Academy. Software, AI, design, data and more — with real projects and a path to employment.",
};

const perks = [
  { icon: Users, title: "Cohort-based", description: "Learn alongside a community, with live instructors and accountability." },
  { icon: Briefcase, title: "Job-ready", description: "Real projects and a portfolio that gets you hired." },
  { icon: Award, title: "Certified", description: "Earn a verifiable certificate on completion." },
  { icon: Calendar, title: "Flexible", description: "Part-time and weekend formats that fit your life." },
];

const categories = ["Engineering", "AI & Data", "Design", "Business"] as const;

export const dynamic = "force-dynamic";

export default async function AcademyPage() {
  const programmes = await getProgrammes();
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Academy", href: "/academy" },
        ]}
      />
      <PageHero
        eyebrow="H-SETS Academy"
        title={<>Start your <span className="text-gradient">tech career</span>, the right way</>}
        description="Structured, cohort-based programmes taught by working professionals — with real projects, mentorship and a pathway to employment."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Academy", href: "/academy" },
        ]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="gradient" size="lg">
            <Link href="#programmes">Browse programmes</Link>
          </Button>
          <Button asChild variant="outlineLight" size="lg">
            <Link href="/contact#consultation">Talk to admissions</Link>
          </Button>
        </div>
      </PageHero>

      {/* Perks */}
      <Section className="py-14">
        <RevealGroup stagger={0.08} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => {
            const Icon = p.icon;
            return (
              <RevealItem key={p.title}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.description}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      {/* Programmes by category */}
      <Section id="programmes" className="pt-0">
        <SectionHeading
          eyebrow="Programmes"
          title="Find the right programme for you"
          description="Ten career-focused tracks across engineering, AI, design and business."
        />
        <div className="mt-14 space-y-14">
          {categories.map((cat) => {
            const items = programmes.filter((p) => p.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat}>
                <Reveal>
                  <h3 className="mb-6 flex items-center gap-3 text-xl font-bold">
                    <span className="h-px w-8 bg-primary" />
                    {cat}
                  </h3>
                </Reveal>
                <RevealGroup stagger={0.06} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((p) => (
                    <RevealItem key={p.slug} className="h-full">
                      <ProgrammeCard programme={p} />
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Corporate training band */}
      <Section className="py-0">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink-gradient p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-10 -top-10 size-64 rounded-full bg-accent/15 blur-3xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-2">
              <div className="text-white">
                <span className="text-sm font-semibold uppercase tracking-widest text-accent">
                  For organisations
                </span>
                <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                  Corporate training, tailored to your team
                </h3>
                <p className="mt-3 text-white/70">
                  Private cohorts, custom curricula and company-level reporting for HR.
                  Upskill your workforce with measurable outcomes.
                </p>
              </div>
              <div className="flex lg:justify-end">
                <Button asChild variant="gradient" size="lg">
                  <Link href="/contact">Request corporate training</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

      <CtaStrip
        title="Not sure which programme fits?"
        description="Book a free guidance call and we'll help you choose the right path for your background and goals."
        primary={{ label: "Book a guidance call", href: "/contact#consultation" }}
        secondary={{ label: "See graduate stories", href: "/" }}
      />
    </>
  );
}

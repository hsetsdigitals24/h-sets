import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Clock, CalendarDays, Wallet, Users } from "lucide-react";
import { programmes, getProgramme } from "@/data/programmes";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { FaqSection } from "@/components/common/faq";
import { CtaStrip } from "@/components/common/cta-strip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CohortCard } from "@/components/cards/cohort-card";
import { BreadcrumbSchema, CourseSchema, FaqSchema } from "@/lib/seo";
import { formatNGN } from "@/lib/utils";

export function generateStaticParams() {
  return programmes.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProgramme(slug);
  if (!p) return {};
  return { title: `${p.name} Programme`, description: p.short };
}

export default async function ProgrammeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const programme = getProgramme(slug);
  if (!programme) notFound();

  const crumbs = [
    { name: "Home", href: "/" },
    { name: "Academy", href: "/academy" },
    { name: programme.name, href: `/academy/${programme.slug}` },
  ];

  const facts = [
    { icon: Clock, label: "Duration", value: `${programme.durationWeeks} weeks` },
    { icon: CalendarDays, label: "Level", value: programme.level },
    { icon: Wallet, label: "From", value: formatNGN(programme.feeInstallment) },
    { icon: Users, label: "Format", value: "Part-time / Weekend" },
  ];

  return (
    <>
      <BreadcrumbSchema items={crumbs} />
      <CourseSchema name={programme.name} description={programme.short} />
      <FaqSchema faqs={programme.faqs} />

      <PageHero
        eyebrow={`Academy · ${programme.category}`}
        title={programme.name}
        description={programme.overview}
        breadcrumbs={crumbs}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="gradient" size="lg">
            <Link href="#cohorts">
              View cohorts
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outlineLight" size="lg">
            <Link href="/contact#consultation">Book a guidance call</Link>
          </Button>
        </div>
      </PageHero>

      {/* Quick facts */}
      <Section className="py-12">
        <RevealGroup stagger={0.06} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {facts.map((f) => {
            const Icon = f.icon;
            return (
              <RevealItem key={f.label}>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs text-muted-foreground">{f.label}</span>
                    <span className="font-semibold">{f.value}</span>
                  </span>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      {/* Outcomes + tools */}
      <Section className="pt-0">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading align="left" eyebrow="Outcomes" title="What you'll be able to do" />
            <ul className="mt-6 space-y-3">
              {programme.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-gradient text-white">
                    <Check className="size-3" />
                  </span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal direction="left">
            <div className="rounded-3xl border border-border bg-secondary/40 p-8">
              <h3 className="font-semibold">Tools &amp; technologies</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {programme.tools.map((t) => (
                  <Badge key={t} variant="outline" className="bg-card px-3 py-1.5 text-sm">
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="mt-8 border-t border-border pt-6">
                <h3 className="font-semibold">Your instructor</h3>
                <div className="mt-4 flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-gradient font-semibold text-white">
                    {programme.instructor.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <div>
                    <p className="font-semibold">{programme.instructor.name}</p>
                    <p className="text-sm text-primary">{programme.instructor.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {programme.instructor.bio}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Curriculum */}
      <Section className="bg-secondary/40">
        <SectionHeading eyebrow="Curriculum" title="Your week-by-week journey" />
        <div className="mx-auto mt-12 max-w-3xl">
          <RevealGroup stagger={0.08} className="relative space-y-4 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
            {programme.curriculum.map((mod) => (
              <RevealItem key={mod.week} className="relative pl-12">
                <span className="absolute left-0 top-1 grid size-10 place-items-center rounded-full border border-border bg-card text-primary shadow-soft">
                  <span className="size-2.5 rounded-full bg-brand-gradient" />
                </span>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{mod.title}</h3>
                    <Badge variant="muted">{mod.week}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mod.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* Cohorts */}
      <Section id="cohorts">
        <SectionHeading
          eyebrow="Enrol"
          title="Upcoming cohorts"
          description="Secure your seat. A small first installment is all it takes to get started."
        />
        <RevealGroup stagger={0.08} className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
          {programme.cohorts.map((c) => (
            <RevealItem key={c.id}>
              <CohortCard cohort={c} programme={programme} />
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal className="mx-auto mt-8 max-w-2xl rounded-2xl border border-border bg-secondary/40 p-5 text-center text-sm text-muted-foreground">
          Full payment {formatNGN(programme.feeFull)} · 2-part installment from{" "}
          {formatNGN(programme.feeInstallment)} · Scholarship slots available on selected
          cohorts.
        </Reveal>
      </Section>

      <FaqSection faqs={programme.faqs} />

      <CtaStrip
        title={`Ready to start ${programme.name}?`}
        description="Apply now or book a free guidance call to ask any questions first."
        primary={{ label: "Book a guidance call", href: "/contact#consultation" }}
        secondary={{ label: "Browse all programmes", href: "/academy" }}
      />
    </>
  );
}

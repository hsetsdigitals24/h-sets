import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { AnimatedCounter } from "@/components/common/animated-counter";
import { CtaStrip } from "@/components/common/cta-strip";
import { aboutStats, values, team, milestones } from "@/data/company";
import { site, fullAddress } from "@/lib/site";
import { TeamMemberCard } from "@/components/cards/team-member-card";
import { BreadcrumbSchema, PersonSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "H-SETS is a Nigerian technology company bridging world-class technology and local businesses — and training the next generation of tech talent.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />
      {/* One Person node per team member. This is how Google establishes that
          real, named people stand behind the brand — a direct EEAT signal, and
          the reason each card carries a stable #slug anchor to point at. */}
      {team.map((m) => (
        <PersonSchema
          key={m.slug}
          name={m.name}
          jobTitle={m.role}
          description={m.bio}
          url={`/about#${m.slug}`}
          {...(m.photo ? { image: m.photo } : {})}
          {...(m.linkedin ? { sameAs: [m.linkedin] } : {})}
        />
      ))}
      <PageHero
        eyebrow="About H-SETS"
        title={<>Building Nigeria&apos;s <span className="text-gradient">technology future</span></>}
        description="We exist to bridge the gap between world-class technology and the businesses and people who need it most."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
      />

      {/* Story */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading align="left" eyebrow="Our story" title="From a small studio to a full ecosystem" />
            <div className="mt-5 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                H-SETS began with a simple frustration: too many Nigerian businesses were
                being underserved by technology, and too much local talent had no clear path
                into tech careers.
              </p>
              <p>
                So we built both sides of the bridge. On one side, a technology partner that
                delivers software, AI and growth to a global standard. On the other, an
                academy that trains people into employable, job-ready professionals.
              </p>
              <p>
                Today, those two sides reinforce each other — and form a single connected
                ecosystem for technology growth in Nigeria.
              </p>
            </div>
          </Reveal>
          <Reveal direction="left">
            <div className="grid grid-cols-2 gap-5">
              {aboutStats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="font-display text-4xl font-bold text-gradient">
                    <AnimatedCounter value={s.value} suffix={s.suffix} prefix={s.prefix} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Mission / vision */}
      <Section className="bg-ink-gradient text-white">
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">Mission</span>
              <p className="mt-4 text-xl leading-relaxed">
                To make world-class technology accessible to every ambitious Nigerian
                business — and to turn talent into opportunity through education.
              </p>
            </div>
          </Reveal>
          <Reveal direction="left">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <span className="text-sm font-semibold uppercase tracking-widest text-accent">Vision</span>
              <p className="mt-4 text-xl leading-relaxed">
                To be the most trusted and discoverable technology growth partner and tech
                academy in Africa.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Values */}
      <Section>
        <SectionHeading eyebrow="What we believe" title="Our values" />
        <RevealGroup stagger={0.06} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <RevealItem key={v.title}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{v.description}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      {/* Timeline */}
      <Section className="bg-secondary/40">
        <SectionHeading eyebrow="Our journey" title="Milestones" />
        <div className="mx-auto mt-12 max-w-3xl">
          <RevealGroup stagger={0.1} className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
            {milestones.map((m) => (
              <RevealItem key={m.year} className="relative pl-12">
                <span className="absolute left-0 top-0 grid size-10 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white shadow-soft">
                  {m.year}
                </span>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* Team */}
      <Section>
        <SectionHeading eyebrow="Our people" title="Meet the team" description="A senior team that's shipped across fintech, health and enterprise." />
        <RevealGroup stagger={0.06} className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <RevealItem key={m.slug} className="h-full">
              <TeamMemberCard member={m} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* Company registration. A visible CAC number is a direct trust signal
          for Nigerian buyers and for Google's quality evaluation. Rendered only
          when NEXT_PUBLIC_CAC_NUMBER is set — a placeholder would be worse
          than the omission. */}
      <Section className="!pt-0">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-secondary/40 p-6 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Company details
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{site.legalName}</span> is a
            technology company registered and operating in Nigeria.
            {site.cacNumber ? (
              <> Registered in Nigeria — CAC Reg. No. {site.cacNumber}.</>
            ) : null}
          </p>
          <address className="mt-2 text-sm not-italic text-muted-foreground">
            {fullAddress}
          </address>
        </div>
      </Section>

      <CtaStrip />
    </>
  );
}

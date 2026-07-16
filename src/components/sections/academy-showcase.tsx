import Link from "next/link";
import { ArrowRight, GraduationCap, Star } from "lucide-react";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { CohortCard } from "@/components/cards/cohort-card";
import { Button } from "@/components/ui/button";
import { upcomingCohorts } from "@/data/programmes";

const successStories = [
  { name: "Fatima B.", role: "AI Engineer at Andela", quote: "The AI track landed me my role — we shipped real projects, not toys." },
  { name: "Chukwuemeka E.", role: "Developer at Paystack", quote: "From an economics degree to a job offer in five months." },
  { name: "Grace A.", role: "Data Analyst", quote: "I switched careers and doubled my income within a year." },
];

export function AcademyShowcase() {
  const cohorts = upcomingCohorts().slice(0, 3);
  return (
    <Section>
      <SectionHeading
        eyebrow="H-SETS Academy"
        title="Launch your tech career with a cohort"
        description="Structured, instructor-led programmes with real projects, mentorship and a path to employment."
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        {/* Upcoming cohorts */}
        <div>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <GraduationCap className="size-4 text-primary" /> Upcoming cohorts
          </div>
          <RevealGroup stagger={0.08} className="space-y-4">
            {cohorts.map((c) => (
              <RevealItem key={c.id}>
                <CohortCard cohort={c} programme={c.programme} compact />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {/* Success stories */}
        <div>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Star className="size-4 text-primary" /> Graduate stories
          </div>
          <RevealGroup stagger={0.08} className="space-y-4">
            {successStories.map((s) => (
              <RevealItem key={s.name}>
                <figure className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-star text-star" />
                    ))}
                  </div>
                  <blockquote className="mt-3 text-sm leading-relaxed text-foreground">
                    “{s.quote}”
                  </blockquote>
                  <figcaption className="mt-3 flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-full bg-brand-gradient text-xs font-semibold text-white">
                      {s.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <span className="text-sm">
                      <span className="font-medium">{s.name}</span>
                      <span className="block text-xs text-muted-foreground">{s.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>

      <Reveal className="mt-12 flex justify-center">
        <Button asChild variant="gradient" size="lg">
          <Link href="/academy">
            Browse all programmes
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Reveal>
    </Section>
  );
}

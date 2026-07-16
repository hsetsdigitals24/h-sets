import type { Metadata } from "next";
import Link from "next/link";
import { Users, Briefcase, GraduationCap } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { JobBoard } from "@/components/sections/job-board";
import { CtaStrip } from "@/components/common/cta-strip";
import { Button } from "@/components/ui/button";
import { BreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Careers & Job Board",
  description:
    "Find tech roles, internships and graduate opportunities — or hire pre-vetted talent from the H-SETS talent pool.",
};

const tracks = [
  { icon: Briefcase, title: "Job Board", description: "Roles from employer partners — searchable and open to all." },
  { icon: GraduationCap, title: "Internships", description: "Paid internships to launch your career with real experience." },
  { icon: Users, title: "Talent Pool", description: "Graduates: opt in and get discovered by hiring partners." },
];

export default function CareersPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Careers", href: "/careers" },
        ]}
      />
      <PageHero
        eyebrow="Careers"
        title={<>Your next <span className="text-gradient">opportunity</span> starts here</>}
        description="Discover tech roles from our employer partners — or, if you're hiring, tap into our pool of trained, job-ready talent."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Careers", href: "/careers" },
        ]}
      >
        <Button asChild variant="outlineLight" size="lg">
          <Link href="/contact">Post a job</Link>
        </Button>
      </PageHero>

      {/* Tracks */}
      <Section className="py-14">
        <RevealGroup stagger={0.08} className="grid gap-5 sm:grid-cols-3">
          {tracks.map((t) => {
            const Icon = t.icon;
            return (
              <RevealItem key={t.title}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <div className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{t.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t.description}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Section>

      {/* Job board */}
      <Section className="pt-0">
        <SectionHeading
          align="left"
          eyebrow="Open roles"
          title="Latest opportunities"
          description="Fresh roles from our hiring partners across Nigeria."
        />
        <Reveal className="mt-10">
          <JobBoard />
        </Reveal>
      </Section>

      <CtaStrip
        title="Hiring tech talent?"
        description="Access pre-vetted, trained graduates from the H-SETS talent pool — and post roles to a relevant audience."
        primary={{ label: "Talk to us about hiring", href: "/contact" }}
        secondary={{ label: "Explore the Academy", href: "/academy" }}
      />
    </>
  );
}

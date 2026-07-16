import type { Metadata } from "next";
import { caseStudies } from "@/data/case-studies";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { RevealGroup, RevealItem } from "@/components/common/reveal";
import { CaseStudyCard } from "@/components/cards/case-study-card";
import { CtaStrip } from "@/components/common/cta-strip";
import { BreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Portfolio & Case Studies",
  description:
    "Real results for real businesses. Explore H-SETS case studies across healthcare, fintech, retail and more.",
};

export default function PortfolioPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Portfolio", href: "/portfolio" },
        ]}
      />
      <PageHero
        eyebrow="Portfolio"
        title={<>Results, not just <span className="text-gradient">deliverables</span></>}
        description="Every project is measured by the outcome it creates. Here's a look at the work and the numbers behind it."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Portfolio", href: "/portfolio" },
        ]}
      />
      <Section>
        <RevealGroup stagger={0.08} className="grid gap-6 md:grid-cols-2">
          {caseStudies.map((study) => (
            <RevealItem key={study.slug} className="h-full">
              <CaseStudyCard study={study} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
      <CtaStrip
        title="Want results like these?"
        description="Let's talk about what we can build for your business."
        secondary={{ label: "Explore services", href: "/services" }}
      />
    </>
  );
}

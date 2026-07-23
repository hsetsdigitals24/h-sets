import type { Metadata } from "next";
import { getIndustries } from "@/lib/content";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { RevealGroup, RevealItem } from "@/components/common/reveal";
import { IndustryTile } from "@/components/cards/industry-tile";
import { CtaStrip } from "@/components/common/cta-strip";
import { BreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "H-SETS delivers technology solutions across healthcare, fintech, education, manufacturing, government, NGOs and real estate.",
};

export const revalidate = 3600; // ISR: rebuilt hourly; admin edits trigger instant on-demand revalidatePath

export default async function IndustriesPage() {
  const industries = await getIndustries();
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Industries", href: "/industries" },
        ]}
      />
      <PageHero
        eyebrow="Industries"
        title={<>Technology built for <span className="text-gradient">your sector</span></>}
        description="We understand the specific challenges of your industry — and we build solutions that fit how you actually work."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Industries", href: "/industries" },
        ]}
      />
      <Section>
        <RevealGroup
          stagger={0.05}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {industries.map((industry) => (
            <RevealItem key={industry.slug}>
              <IndustryTile industry={industry} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
      <CtaStrip
        title="Don't see your industry?"
        description="We've worked across many sectors. Tell us about your business and we'll show you what's possible."
        secondary={{ label: "View services", href: "/services" }}
      />
    </>
  );
}

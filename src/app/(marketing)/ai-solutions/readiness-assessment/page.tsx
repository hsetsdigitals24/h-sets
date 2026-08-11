import type { Metadata } from "next";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { ReadinessAssessment } from "@/components/assessment/readiness-assessment";
import { BreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Readiness Assessment",
  description:
    "Take the free H-SETS AI Readiness Self-Assessment. Answer 6 quick questions and get a tailored view of where AI can cut costs and unlock growth in your business.",
};

export default function ReadinessAssessmentPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "AI Solutions", href: "/ai-solutions" },
          { name: "Readiness Assessment", href: "/ai-solutions/readiness-assessment" },
        ]}
      />
      <PageHero
        eyebrow="Free assessment"
        title={
          <>
            AI Readiness <span className="text-gradient">Assessment</span>
          </>
        }
        description="Answer 6 quick questions about your data, process and goals. Get a tailored readiness score and your highest-ROI next steps — in under 3 minutes."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "AI Solutions", href: "/ai-solutions" },
          { name: "Readiness Assessment", href: "/ai-solutions/readiness-assessment" },
        ]}
      />
      <Section>
        <ReadinessAssessment />
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { ResourcesGrid } from "@/components/sections/resources-grid";
import { CtaStrip } from "@/components/common/cta-strip";
import { BreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Resource Hub",
  description:
    "Free e-books, templates, checklists, playbooks and reports to help you grow your business and skills — from H-SETS.",
};

export default function ResourcesPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Resources", href: "/resources" },
        ]}
      />
      <PageHero
        eyebrow="Resource Hub"
        title={<>Free tools to <span className="text-gradient">grow faster</span></>}
        description="Practical e-books, templates, checklists and reports — created by our team and free to download."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Resources", href: "/resources" },
        ]}
      />
      <Section>
        <ResourcesGrid />
      </Section>
      <CtaStrip
        title="Need something more tailored?"
        description="Book a free consultation and we'll point you to exactly what your business needs."
        secondary={{ label: "Explore services", href: "/services" }}
      />
    </>
  );
}

import type { Metadata } from "next";
import { getServices } from "@/lib/content";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { RevealGroup, RevealItem } from "@/components/common/reveal";
import { ServiceCard } from "@/components/cards/service-card";
import { CtaStrip } from "@/components/common/cta-strip";
import { BreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Services",
  description:
    "From websites and software to AI automation and digital marketing — explore the full range of H-SETS technology services.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
        ]}
      />
      <PageHero
        eyebrow="Services"
        title={<>Everything you need to <span className="text-gradient">grow with technology</span></>}
        description="One partner for your whole digital journey — strategy, design, build, automation and growth."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
        ]}
      />
      <Section>
        <RevealGroup
          stagger={0.05}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <RevealItem key={service.slug} className="h-full">
              <ServiceCard service={service} />
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>
      <CtaStrip
        title="Not sure which service you need?"
        description="Book a free consultation and we'll help you map the right path for your goals and budget."
        secondary={{ label: "See our work", href: "/portfolio" }}
      />
    </>
  );
}

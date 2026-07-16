import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import { Section, SectionHeading } from "@/components/common/section";
import { RevealGroup, RevealItem } from "@/components/common/reveal";
import { ServiceCard } from "@/components/cards/service-card";
import { Button } from "@/components/ui/button";

export function ServicesOverview() {
  return (
    <Section>
      <SectionHeading
        eyebrow="What we do"
        title="One partner for everything technology"
        description="From your first website to enterprise AI, we cover the full stack of digital growth so you don't have to juggle vendors."
      />
      <RevealGroup
        stagger={0.06}
        className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        {services.map((service) => (
          <RevealItem key={service.slug} className="h-full">
            <ServiceCard service={service} />
          </RevealItem>
        ))}
      </RevealGroup>
      <div className="mt-12 flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/services">
            View all services
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

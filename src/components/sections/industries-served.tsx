import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { industries } from "@/data/industries";
import { Section, SectionHeading } from "@/components/common/section";
import { RevealGroup, RevealItem } from "@/components/common/reveal";
import { IndustryTile } from "@/components/cards/industry-tile";
import { Button } from "@/components/ui/button";

export function IndustriesServed() {
  return (
    <Section className="bg-secondary/40">
      <SectionHeading
        eyebrow="Industries"
        title="Deep expertise across sectors"
        description="We speak your industry's language and understand the problems you're actually trying to solve."
      />
      <RevealGroup
        stagger={0.05}
        className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {industries.map((industry) => (
          <RevealItem key={industry.slug}>
            <IndustryTile industry={industry} />
          </RevealItem>
        ))}
      </RevealGroup>
      <div className="mt-12 flex justify-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/industries">
            Explore industries
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

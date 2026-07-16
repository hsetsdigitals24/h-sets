import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { insights } from "@/data/insights";
import { Section, SectionHeading } from "@/components/common/section";
import { RevealGroup, RevealItem } from "@/components/common/reveal";
import { InsightCard } from "@/components/cards/insight-card";
import { Button } from "@/components/ui/button";

export function RecentInsights() {
  const latest = insights.slice(0, 3);
  return (
    <Section>
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          align="left"
          eyebrow="Insights"
          title="Ideas worth your time"
          description="Practical perspectives on technology, AI and building a career in tech."
          className="max-w-xl"
        />
        <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
          <Link href="/insights">
            View all insights
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
      <RevealGroup stagger={0.08} className="mt-12 grid gap-6 md:grid-cols-3">
        {latest.map((insight) => (
          <RevealItem key={insight.slug} className="h-full">
            <InsightCard insight={insight} />
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/data/case-studies";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
    >
      <div className={cn("relative h-44 overflow-hidden", study.accent)}>
        <div className="absolute inset-0 flex flex-col justify-between p-5">
          <div className="flex gap-2">
            <Badge variant="glass">{study.industry}</Badge>
            <Badge variant="glass">{study.service}</Badge>
          </div>
          <span className="font-display text-2xl font-bold text-white">{study.client}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold leading-snug transition-colors group-hover:text-primary">
          {study.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {study.summary}
        </p>
        <div className="mt-4 flex items-center gap-4">
          {study.results.slice(0, 3).map((r) => (
            <div key={r.label}>
              <p className="text-lg font-bold text-gradient">{r.metric}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">{r.label}</p>
            </div>
          ))}
          <ArrowUpRight className="ml-auto size-5 text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

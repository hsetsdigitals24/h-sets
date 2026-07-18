import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Insight } from "@/data/insights";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Link
      href={`/insights/${insight.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
    >
      <div className={cn("relative h-40 overflow-hidden", insight.accent)}>
        <span className="absolute left-4 top-4">
          <Badge variant="glass">{insight.category}</Badge>
        </span>
        <ArrowUpRight className="absolute bottom-4 right-4 size-6 text-white/80 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold leading-snug transition-colors group-hover:text-primary">
          {insight.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {insight.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{insight.author}</span>
          <span className="flex items-center gap-3">
            <span>{formatDate(insight.date)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> {insight.readMins}m
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

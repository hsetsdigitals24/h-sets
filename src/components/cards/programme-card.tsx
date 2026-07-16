import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Programme } from "@/data/programmes";
import { Badge } from "@/components/ui/badge";
import { formatNGN } from "@/lib/utils";

export function ProgrammeCard({ programme }: { programme: Programme }) {
  const Icon = programme.icon;
  const openSeats = programme.cohorts.reduce((n, c) => n + c.seatsLeft, 0);
  return (
    <Link
      href={`/academy/${programme.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_-20px_var(--primary)]"
    >
      <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand-gradient transition-transform duration-300 group-hover:scale-x-100" />
      <div className="flex items-start justify-between">
        <div className="grid size-12 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-6" />
        </div>
        <Badge variant="muted">{programme.level}</Badge>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{programme.name}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
        {programme.short}
      </p>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5 text-primary" /> {programme.durationWeeks} weeks
        </span>
        {openSeats > 0 && (
          <span className="text-emerald-600">{openSeats} seats open</span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted-foreground">From</p>
          <p className="font-semibold">{formatNGN(programme.feeInstallment)}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          View programme
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

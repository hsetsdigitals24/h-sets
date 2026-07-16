import Link from "next/link";
import { CalendarDays, Clock, Users, ArrowRight } from "lucide-react";
import type { Cohort, Programme } from "@/data/programmes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatNGN, cn } from "@/lib/utils";

const statusStyle: Record<Cohort["status"], string> = {
  Open: "success",
  "Filling Fast": "accent",
  Full: "muted",
  Waitlist: "muted",
};

export function CohortCard({
  cohort,
  programme,
  compact = false,
}: {
  cohort: Cohort;
  programme: Programme;
  compact?: boolean;
}) {
  const Icon = programme.icon;
  const full = cohort.status === "Full" || cohort.status === "Waitlist";
  const pct = Math.round(((cohort.seatsTotal - cohort.seatsLeft) / cohort.seatsTotal) * 100);

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
            <Icon className="size-5" />
          </div>
          <div>
            <h3 className="font-semibold leading-tight">{programme.name}</h3>
            <p className="text-xs text-muted-foreground">{cohort.format}</p>
          </div>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Badge variant={statusStyle[cohort.status] as any}>{cohort.status}</Badge>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="size-4 text-primary" />
          <span>{formatDate(cohort.startDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-4 text-primary" />
          <span>{programme.durationWeeks} weeks</span>
        </div>
        {!compact && (
          <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
            <Users className="size-4 text-primary" />
            <span>{cohort.seatsLeft} of {cohort.seatsTotal} seats left</span>
          </div>
        )}
      </dl>

      {!compact && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full rounded-full bg-brand-gradient")}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted-foreground">From</p>
          <p className="font-semibold">{formatNGN(programme.feeInstallment)}</p>
        </div>
        <Button asChild size="sm" variant={full ? "outline" : "gradient"}>
          <Link href={`/academy/${programme.slug}`}>
            {full ? "Join Waitlist" : "View cohort"}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

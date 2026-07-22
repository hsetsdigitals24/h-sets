import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import {
  LEAD_STATUSES,
  STATUS_LABELS,
  TIERS,
  TIER_LABELS,
} from "@/lib/leads";

export const dynamic = "force-dynamic";

/** A labelled horizontal bar row: label, count, and a proportional fill. */
function BarRow({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5 text-sm">
      <span className="w-28 shrink-0 capitalize text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right font-medium">{count}</span>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </div>
  );
}

export default async function LeadAnalyticsPage() {
  await requireSection("leads");

  const [total, bySource, byTier, byStatus, wonCount] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.groupBy({ by: ["source"], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["tier"], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.count({ where: { status: "won" } }),
  ]);

  const sourceRows = bySource
    .map((r) => ({ label: r.source ?? "—", count: r._count._all }))
    .sort((a, b) => b.count - a.count);
  const sourceMax = Math.max(1, ...sourceRows.map((r) => r.count));

  const tierCount = (t: string) =>
    byTier.find((r) => r.tier === t)?._count._all ?? 0;
  const tierMax = Math.max(1, ...TIERS.map(tierCount));

  const statusCount = (s: string) =>
    byStatus.find((r) => r.status === s)?._count._all ?? 0;
  const statusMax = Math.max(1, ...LEAD_STATUSES.map(statusCount));

  const conversion = total > 0 ? Math.round((wonCount / total) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        back={{ href: "/admin/leads", label: "Back to leads" }}
        title="CRM analytics"
        description={`${total} lead${total === 1 ? "" : "s"} · ${conversion}% won`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Leads by source">
          {sourceRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads yet.</p>
          ) : (
            sourceRows.map((r) => (
              <BarRow key={r.label} label={r.label} count={r.count} max={sourceMax} />
            ))
          )}
        </Panel>

        <Panel title="Leads by tier">
          {TIERS.map((t) => (
            <BarRow key={t} label={TIER_LABELS[t]} count={tierCount(t)} max={tierMax} />
          ))}
        </Panel>

        <Panel title="Pipeline by status">
          {LEAD_STATUSES.map((s) => (
            <BarRow
              key={s}
              label={STATUS_LABELS[s]}
              count={statusCount(s)}
              max={statusMax}
            />
          ))}
        </Panel>

        <Panel title="Conversion">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{conversion}%</span>
            <span className="text-sm text-muted-foreground">
              {wonCount} won of {total}
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TIER_LABELS,
  TIER_VARIANT,
  type LeadTier,
} from "@/lib/leads";
import { LeadEditForm } from "../lead-edit-form";
import { LeadAssignForm } from "../lead-assign-form";
import { deleteLead } from "../actions";

export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<string, string> = {
  created: "Captured",
  status_changed: "Status change",
  assigned: "Assignment",
  score_changed: "Score change",
  note_added: "Note",
  nurture_sent: "Nurture email",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-border py-3 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm break-words">{value || "—"}</dd>
    </div>
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSection("leads");
  const { id } = await params;

  let lead;
  try {
    lead = await prisma.lead.findUnique({
      where: { id: BigInt(id) },
      include: { owner: { select: { id: true, name: true } } },
    });
  } catch {
    notFound();
  }
  if (!lead) notFound();

  const [owners, events] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["SALES_ADMIN", "SUPER_ADMIN"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.leadEvent.findMany({
      where: { leadId: BigInt(id) },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const tier = lead.tier as LeadTier;
  const data = (lead.data ?? {}) as Record<string, unknown>;
  const dataEntries = Object.entries(data);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        title={lead.name ?? "Lead"}
        description={`Received ${lead.createdAt.toLocaleString()}`}
        action={
          <div className="flex items-center gap-2">
            <Badge variant={TIER_VARIANT[tier] ?? "muted"}>
              {TIER_LABELS[tier] ?? lead.tier}
            </Badge>
            <Badge variant="muted">{lead.type}</Badge>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-sm font-semibold">Contact details</h2>
            <dl>
              <Field label="Name" value={lead.name} />
              <Field
                label="Email"
                value={
                  lead.email ? (
                    <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                      {lead.email}
                    </a>
                  ) : null
                }
              />
              <Field label="Phone" value={lead.phone} />
              <Field label="Company" value={lead.company} />
              <Field label="Source" value={lead.source} />
              <Field label="Score" value={`${lead.score} · ${TIER_LABELS[tier] ?? lead.tier}`} />
              <Field label="Owner" value={lead.owner?.name} />
            </dl>

            {dataEntries.length > 0 && (
              <>
                <h2 className="mb-3 mt-6 text-sm font-semibold">Submission data</h2>
                <dl>
                  {dataEntries.map(([key, value]) => (
                    <Field
                      key={key}
                      label={key}
                      value={
                        typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value ?? "")
                      }
                    />
                  ))}
                </dl>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-3 text-sm font-semibold">Activity</h2>
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ol className="space-y-3">
                {events.map((ev) => (
                  <li key={ev.id} className="flex gap-3 text-sm">
                    <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary/60" />
                    <div>
                      <p>{ev.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {EVENT_LABELS[ev.type] ?? ev.type} ·{" "}
                        {ev.createdAt.toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 text-sm font-semibold">Assignment</h2>
            <LeadAssignForm
              id={lead.id.toString()}
              ownerId={lead.ownerId}
              owners={owners}
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="mb-4 text-sm font-semibold">Manage lead</h2>
            <LeadEditForm
              id={lead.id.toString()}
              status={lead.status}
              score={lead.score}
              notes={lead.notes}
            />
          </div>

          <div className="rounded-2xl border border-destructive/30 bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
            <p className="mt-1 mb-3 text-sm text-muted-foreground">
              Permanently delete this lead. This cannot be undone.
            </p>
            <form action={deleteLead}>
              <input type="hidden" name="id" value={lead.id.toString()} />
              <Button type="submit" variant="outline" size="sm" className="text-destructive">
                <Trash2 className="size-4" /> Delete lead
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { PageHeading } from "@/components/admin/page-heading";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  LEAD_STATUSES,
  LEAD_TYPES,
  STATUS_LABELS,
  STATUS_VARIANT,
  TIERS,
  TIER_LABELS,
  TIER_VARIANT,
  type LeadStatus,
  type LeadTier,
} from "@/lib/leads";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = {
  q?: string;
  type?: string;
  status?: string;
  tier?: string;
  owner?: string;
  page?: string;
};

/** Build a URLSearchParams from the active filters (excluding page). */
function filterParams(sp: SearchParams): URLSearchParams {
  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.type) params.set("type", sp.type);
  if (sp.status) params.set("status", sp.status);
  if (sp.tier) params.set("tier", sp.tier);
  if (sp.owner) params.set("owner", sp.owner);
  return params;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireSection("leads");
  const sp = await searchParams;

  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.LeadWhereInput = {};
  if (sp.type && LEAD_TYPES.includes(sp.type as (typeof LEAD_TYPES)[number])) {
    where.type = sp.type;
  }
  if (sp.status && LEAD_STATUSES.includes(sp.status as LeadStatus)) {
    where.status = sp.status;
  }
  if (sp.tier && TIERS.includes(sp.tier as LeadTier)) {
    where.tier = sp.tier;
  }
  if (sp.owner) {
    where.ownerId = sp.owner === "unassigned" ? null : sp.owner;
  }
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { email: { contains: sp.q, mode: "insensitive" } },
      { company: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const [total, leads, owners] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      include: { owner: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.findMany({
      where: { role: { in: ["SALES_ADMIN", "SUPER_ADMIN"] } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportQuery = filterParams(sp);

  return (
    <div>
      <PageHeading
        back={{ href: "/admin", label: "Back to dashboard" }}
        title="Leads / CRM"
        description={`${total} submission${total === 1 ? "" : "s"} captured.`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/leads/analytics">Analytics</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={`/admin/leads/export?${exportQuery.toString()}`}>Export CSV</a>
            </Button>
          </div>
        }
      />

      <form className="mb-4 flex flex-wrap items-end gap-3" method="get">
        <div className="flex-1 min-w-[200px]">
          <Input
            name="q"
            placeholder="Search name, email or company…"
            defaultValue={sp.q ?? ""}
          />
        </div>
        <Select name="type" defaultValue={sp.type ?? ""} className="w-auto min-w-[140px]">
          <option value="">All types</option>
          {LEAD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Select name="tier" defaultValue={sp.tier ?? ""} className="w-auto min-w-[130px]">
          <option value="">All tiers</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>
              {TIER_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select name="status" defaultValue={sp.status ?? ""} className="w-auto min-w-[140px]">
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select name="owner" defaultValue={sp.owner ?? ""} className="w-auto min-w-[150px]">
          <option value="">All owners</option>
          <option value="unassigned">Unassigned</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline" size="sm">
          Filter
        </Button>
      </form>

      <div className="rounded-2xl border border-border bg-card shadow-soft">
        {leads.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No leads match your filters.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id.toString()}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/leads/${lead.id}`} className="hover:underline">
                      {lead.name ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="muted">{lead.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={TIER_VARIANT[lead.tier as LeadTier] ?? "muted"}>
                      {TIER_LABELS[lead.tier as LeadTier] ?? lead.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.email ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.owner?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[lead.status as LeadStatus] ?? "muted"}>
                      {STATUS_LABELS[lead.status as LeadStatus] ?? lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.score}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {lead.createdAt.toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <PageLink sp={sp} page={page - 1} disabled={page <= 1}>
              ← Previous
            </PageLink>
            <PageLink sp={sp} page={page + 1} disabled={page >= totalPages}>
              Next →
            </PageLink>
          </div>
        </div>
      )}
    </div>
  );
}

function PageLink({
  sp,
  page,
  disabled,
  children,
}: {
  sp: SearchParams;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="rounded-full border border-border px-4 py-2 text-muted-foreground opacity-50">
        {children}
      </span>
    );
  }
  const params = filterParams(sp);
  params.set("page", String(page));
  return (
    <Link
      href={`/admin/leads?${params.toString()}`}
      className="rounded-full border border-border px-4 py-2 transition-colors hover:bg-secondary"
    >
      {children}
    </Link>
  );
}

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSection } from "@/lib/auth";
import { LEAD_STATUSES, LEAD_TYPES, type LeadStatus } from "@/lib/leads";

export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  const s =
    value === null || value === undefined
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);
  // Escape quotes and wrap when the value contains a delimiter/newline.
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  await requireSection("leads");

  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  const type = url.searchParams.get("type") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;

  const where: Prisma.LeadWhereInput = {};
  if (type && LEAD_TYPES.includes(type as (typeof LEAD_TYPES)[number])) {
    where.type = type;
  }
  if (status && LEAD_STATUSES.includes(status as LeadStatus)) {
    where.status = status;
  }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "id",
    "type",
    "name",
    "email",
    "phone",
    "company",
    "source",
    "status",
    "score",
    "notes",
    "data",
    "created_at",
  ];
  const rows = leads.map((l) =>
    [
      l.id.toString(),
      l.type,
      l.name,
      l.email,
      l.phone,
      l.company,
      l.source,
      l.status,
      l.score,
      l.notes,
      l.data,
      l.createdAt.toISOString(),
    ]
      .map(csvCell)
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");

  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

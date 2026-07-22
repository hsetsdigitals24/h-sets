// One-off backfill: recompute score + tier for every existing lead using the
// current scoring logic. Safe to re-run (idempotent).
//
//   node --experimental-strip-types prisma/scripts/backfill-lead-scores.ts

import { PrismaClient } from "@prisma/client";
import { scoreLead, tierForScore } from "../../src/lib/lead-scoring.ts";

const prisma = new PrismaClient();

async function main() {
  const leads = await prisma.lead.findMany({
    select: { id: true, type: true, source: true, data: true },
  });

  let updated = 0;
  for (const lead of leads) {
    const score = scoreLead({
      type: lead.type,
      source: lead.source,
      data: (lead.data ?? {}) as Record<string, unknown>,
    });
    const tier = tierForScore(score);
    await prisma.lead.update({ where: { id: lead.id }, data: { score, tier } });
    updated++;
  }

  console.info(`Backfilled ${updated} lead(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

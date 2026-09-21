// Targeted re-seed for Service rows only.
//
// `npm run db:seed` runs every seeder (admin, instructors, programmes, jobs,
// insights, resources, testimonials, portfolio, industries), which overwrites
// content in tables a service-copy change has no business touching. This script
// upserts services alone — same logic as `seedServices()` in seed.ts.
//
//   npm run db:seed:services
import { PrismaClient, Prisma } from "@prisma/client";
import { services } from "../src/data/services.ts";

const prisma = new PrismaClient();

function iconName(icon: { displayName?: string; name?: string }) {
  return icon.displayName || icon.name || "Sparkles";
}

for (const [i, s] of services.entries()) {
  const data = {
    name: s.name,
    icon: iconName(s.icon),
    tagline: s.tagline,
    short: s.short,
    hero: s.hero,
    problem: s.problem,
    outcomes: s.outcomes,
    features: s.features,
    process: s.process,
    faqs: s.faqs,
    related: s.related,
    metaTitle: s.metaTitle ?? null,
    metaDescription: s.metaDescription ?? null,
    sections: (s.sections ?? Prisma.DbNull) as Prisma.InputJsonValue,
    sortOrder: i,
  };
  await prisma.service.upsert({
    where: { slug: s.slug },
    update: data,
    create: { slug: s.slug, ...data },
  });
  console.log(
    `[seed] ${s.slug}${s.metaTitle ? " +meta" : ""}${
      s.sections ? ` +${s.sections.length} sections` : ""
    }`
  );
}

await prisma.$disconnect();

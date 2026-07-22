import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

import { programmes } from "../src/data/programmes.ts";
import { instructors } from "../src/data/instructors.ts";
import { jobs } from "../src/data/jobs.ts";
import { insights } from "../src/data/insights.ts";
import { resources } from "../src/data/resources.ts";
import { testimonials } from "../src/data/testimonials.ts";
import { portfolioItems } from "../src/data/portfolio.ts";
import { services } from "../src/data/services.ts";
import { industries } from "../src/data/industries.ts";

const prisma = new PrismaClient();

/** Lucide icon components carry their PascalCase name on `displayName`. */
function iconName(icon: unknown): string {
  const c = icon as { displayName?: string; render?: { displayName?: string } };
  return c?.displayName || c?.render?.displayName || "Sparkles";
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping Super Admin creation."
    );
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: Role.SUPER_ADMIN },
    create: {
      email,
      name: process.env.ADMIN_NAME || "Super Admin",
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`[seed] Super Admin ready: ${email}`);
}

// Instructors are seeded idempotently, keyed by name (no unique constraint, so
// we find-or-create). Each instructor also gets a linked User (role INSTRUCTOR)
// so they appear in Team & Roles and can access the instructor portal. Returns
// a name -> id map used to link programmes.
async function seedInstructors(): Promise<Map<string, string>> {
  const byName = new Map<string, string>();
  // Shared default password for seeded instructor logins.
  const passwordHash = await bcrypt.hash(
    process.env.INSTRUCTOR_SEED_PASSWORD || "instructor123",
    12
  );
  for (const [i, ins] of instructors.entries()) {
    // Provision (or refresh) the login account first, keyed by unique email.
    const user = await prisma.user.upsert({
      where: { email: ins.email },
      update: { name: ins.name, role: Role.INSTRUCTOR },
      create: { name: ins.name, email: ins.email, role: Role.INSTRUCTOR, passwordHash },
    });
    const existing = await prisma.instructor.findFirst({ where: { name: ins.name } });
    const row = existing
      ? await prisma.instructor.update({
          where: { id: existing.id },
          data: { title: ins.title, bio: ins.bio, sortOrder: i, userId: user.id },
        })
      : await prisma.instructor.create({
          data: {
            name: ins.name,
            title: ins.title,
            bio: ins.bio,
            sortOrder: i,
            userId: user.id,
          },
        });
    byName.set(ins.name, row.id);
  }
  console.log(`[seed] ${instructors.length} instructors seeded.`);
  return byName;
}

async function seedProgrammes(instructorIds: Map<string, string>) {
  for (const [i, p] of programmes.entries()) {
    const instructorId = instructorIds.get(p.instructor.name) ?? null;
    const programme = await prisma.programme.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        icon: iconName(p.icon),
        level: p.level,
        category: p.category,
        durationWeeks: p.durationWeeks,
        feeFull: p.feeFull,
        feeInstallment: p.feeInstallment,
        short: p.short,
        overview: p.overview,
        outcomes: p.outcomes,
        curriculum: p.curriculum,
        tools: p.tools,
        instructorId,
        faqs: p.faqs,
        sortOrder: i,
      },
      create: {
        slug: p.slug,
        name: p.name,
        icon: iconName(p.icon),
        level: p.level,
        category: p.category,
        durationWeeks: p.durationWeeks,
        feeFull: p.feeFull,
        feeInstallment: p.feeInstallment,
        short: p.short,
        overview: p.overview,
        outcomes: p.outcomes,
        curriculum: p.curriculum,
        tools: p.tools,
        instructorId,
        faqs: p.faqs,
        sortOrder: i,
      },
    });
    // Rebuild cohorts for this programme (idempotent).
    await prisma.cohort.deleteMany({ where: { programmeId: programme.id } });
    for (const c of p.cohorts) {
      await prisma.cohort.create({
        data: {
          programmeId: programme.id,
          startDate: c.startDate,
          endDate: c.endDate,
          format: c.format,
          seatsTotal: c.seatsTotal,
          seatsLeft: c.seatsLeft,
          status: c.status,
          instructors: instructorId ? { connect: { id: instructorId } } : undefined,
        },
      });
    }
  }
  console.log(`[seed] ${programmes.length} programmes seeded.`);
}

async function seedJobs() {
  await prisma.job.deleteMany();
  for (const j of jobs) {
    await prisma.job.create({
      data: {
        title: j.title,
        company: j.company,
        type: j.type,
        location: j.location,
        mode: j.mode,
        salary: j.salary,
        category: j.category,
        posted: j.posted,
        deadline: j.deadline,
        summary: j.summary,
      },
    });
  }
  console.log(`[seed] ${jobs.length} jobs seeded.`);
}

async function seedInsights() {
  for (const n of insights) {
    await prisma.insight.upsert({
      where: { slug: n.slug },
      update: {
        title: n.title,
        excerpt: n.excerpt,
        category: n.category,
        author: n.author,
        authorRole: n.authorRole,
        date: n.date,
        readMins: n.readMins,
        accent: n.accent,
        body: n.body,
      },
      create: {
        slug: n.slug,
        title: n.title,
        excerpt: n.excerpt,
        category: n.category,
        author: n.author,
        authorRole: n.authorRole,
        date: n.date,
        readMins: n.readMins,
        accent: n.accent,
        body: n.body,
      },
    });
  }
  console.log(`[seed] ${insights.length} insights seeded.`);
}

async function seedResources() {
  for (const [i, r] of resources.entries()) {
    await prisma.resource.upsert({
      where: { slug: r.id },
      update: {
        title: r.title,
        type: r.type,
        icon: iconName(r.icon),
        description: r.description,
        gate: r.gate,
        tag: r.tag,
        accent: r.accent,
        sortOrder: i,
      },
      create: {
        slug: r.id,
        title: r.title,
        type: r.type,
        icon: iconName(r.icon),
        description: r.description,
        gate: r.gate,
        tag: r.tag,
        accent: r.accent,
        sortOrder: i,
      },
    });
  }
  console.log(`[seed] ${resources.length} resources seeded.`);
}

async function seedTestimonials() {
  await prisma.testimonial.deleteMany();
  for (const [i, t] of testimonials.entries()) {
    await prisma.testimonial.create({
      data: {
        name: t.name,
        role: t.role,
        company: t.company,
        quote: t.quote,
        rating: t.rating,
        initials: t.initials,
        sortOrder: i,
      },
    });
  }
  console.log(`[seed] ${testimonials.length} testimonials seeded.`);
}

async function seedPortfolio() {
  for (const cs of portfolioItems) {
    await prisma.portfolio.upsert({
      where: { slug: cs.slug },
      update: {
        client: cs.client,
        industry: cs.industry,
        service: cs.service,
        title: cs.title,
        summary: cs.summary,
        challenge: cs.challenge,
        solution: cs.solution,
        results: cs.results,
        tech: cs.tech,
        testimonial: cs.testimonial ?? undefined,
        related: cs.related,
        accent: cs.accent,
      },
      create: {
        slug: cs.slug,
        client: cs.client,
        industry: cs.industry,
        service: cs.service,
        title: cs.title,
        summary: cs.summary,
        challenge: cs.challenge,
        solution: cs.solution,
        results: cs.results,
        tech: cs.tech,
        testimonial: cs.testimonial ?? undefined,
        related: cs.related,
        accent: cs.accent,
      },
    });
  }
  console.log(`[seed] ${portfolioItems.length} portfolio items seeded.`);
}

async function seedServices() {
  for (const [i, s] of services.entries()) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
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
        sortOrder: i,
      },
      create: {
        slug: s.slug,
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
        sortOrder: i,
      },
    });
  }
  console.log(`[seed] ${services.length} services seeded.`);
}

async function seedIndustries() {
  for (const [i, ind] of industries.entries()) {
    await prisma.industry.upsert({
      where: { slug: ind.slug },
      update: {
        name: ind.name,
        icon: iconName(ind.icon),
        short: ind.short,
        hero: ind.hero,
        challenges: ind.challenges,
        solutions: ind.solutions,
        useCases: ind.useCases,
        stat: ind.stat,
        faqs: ind.faqs,
        sortOrder: i,
      },
      create: {
        slug: ind.slug,
        name: ind.name,
        icon: iconName(ind.icon),
        short: ind.short,
        hero: ind.hero,
        challenges: ind.challenges,
        solutions: ind.solutions,
        useCases: ind.useCases,
        stat: ind.stat,
        faqs: ind.faqs,
        sortOrder: i,
      },
    });
  }
  console.log(`[seed] ${industries.length} industries seeded.`);
}

// Ensures every INSTRUCTOR-role user (including those created manually via
// Team & Roles) has an Instructor content profile so they are selectable on
// cohorts/programmes. Idempotent and safe to re-run.
async function backfillInstructorProfiles() {
  const users = await prisma.user.findMany({
    where: { role: Role.INSTRUCTOR, instructor: null },
    select: { id: true, name: true },
  });
  for (const u of users) {
    const sortOrder = await prisma.instructor.count();
    await prisma.instructor.create({
      data: { name: u.name, title: "Instructor", bio: "Profile coming soon.", sortOrder, userId: u.id },
    });
  }
  if (users.length) console.log(`[seed] ${users.length} instructor profile(s) backfilled.`);
}

async function main() {
  await seedAdmin();
  const instructorIds = await seedInstructors();
  await backfillInstructorProfiles();
  await seedProgrammes(instructorIds);
  await seedJobs();
  await seedInsights();
  await seedResources();
  await seedTestimonials();
  await seedPortfolio();
  await seedServices();
  await seedIndustries();
  console.log("[seed] Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

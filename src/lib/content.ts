import "server-only";
import { prisma } from "./prisma";
import { getIcon } from "./icon-map";
import { bodyToHtml } from "./content-forms";
import type { Programme, Cohort } from "@/data/programmes";
import type { Job } from "@/data/jobs";
import type { Insight } from "@/data/insights";
import type { ResourceView } from "@/data/resources";
import type { Testimonial } from "@/data/testimonials";
import type { PortfolioItem } from "@/data/portfolio";
import type { Service } from "@/data/services";
import type { Industry } from "@/data/industries";

/**
 * Public content read layer. Returns objects shaped exactly like the legacy
 * static `src/data/*` exports (icons resolved to Lucide components, JSON fields
 * cast) so marketing pages/components consume them unchanged. Only published
 * rows are returned. Admin mutations call revalidatePath on the relevant public
 * routes, and these pages render dynamically, so edits appear immediately.
 */

type CohortRow = {
  id: string;
  startDate: string;
  endDate: string;
  format: string;
  seatsTotal: number;
  seatsLeft: number;
  status: string;
};

function mapCohort(c: CohortRow): Cohort {
  return {
    id: c.id,
    startDate: c.startDate,
    endDate: c.endDate,
    format: c.format as Cohort["format"],
    seatsTotal: c.seatsTotal,
    seatsLeft: c.seatsLeft,
    status: c.status as Cohort["status"],
  };
}

type ProgrammeRow = {
  slug: string;
  name: string;
  icon: string;
  level: string;
  category: string;
  durationWeeks: number;
  feeFull: number;
  feeInstallment: number;
  short: string;
  overview: string;
  outcomes: unknown;
  curriculum: unknown;
  tools: unknown;
  instructor: { name: string; title: string; bio: string } | null;
  faqs: unknown;
  cohorts: CohortRow[];
};

function mapProgramme(p: ProgrammeRow): Programme {
  return {
    slug: p.slug,
    name: p.name,
    icon: getIcon(p.icon),
    level: p.level,
    category: p.category,
    durationWeeks: p.durationWeeks,
    feeFull: p.feeFull,
    feeInstallment: p.feeInstallment,
    short: p.short,
    overview: p.overview,
    outcomes: p.outcomes as Programme["outcomes"],
    curriculum: p.curriculum as Programme["curriculum"],
    tools: p.tools as Programme["tools"],
    instructor: p.instructor ?? { name: "", title: "", bio: "" },
    faqs: p.faqs as Programme["faqs"],
    cohorts: p.cohorts.map(mapCohort),
  };
}

export async function getProgrammes(): Promise<Programme[]> {
  const rows = await prisma.programme.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    include: {
      cohorts: { where: { published: true }, orderBy: { startDate: "asc" } },
      instructor: { select: { name: true, title: true, bio: true } },
    },
  });
  return rows.map(mapProgramme);
}

export async function getProgramme(slug: string): Promise<Programme | null> {
  const row = await prisma.programme.findFirst({
    where: { slug, published: true },
    include: {
      cohorts: { where: { published: true }, orderBy: { startDate: "asc" } },
      instructor: { select: { name: true, title: true, bio: true } },
    },
  });
  return row ? mapProgramme(row) : null;
}

export async function upcomingCohorts(): Promise<
  (Cohort & { programme: Programme })[]
> {
  const programmes = await getProgrammes();
  return programmes
    .flatMap((p) => p.cohorts.map((c) => ({ ...c, programme: p })))
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
}

export async function getJobs(): Promise<Job[]> {
  const rows = await prisma.job.findMany({
    where: { published: true },
    orderBy: { posted: "desc" },
  });
  return rows.map((j) => ({
    id: j.id,
    title: j.title,
    company: j.company,
    type: j.type as Job["type"],
    location: j.location,
    mode: j.mode as Job["mode"],
    salary: j.salary,
    category: j.category,
    posted: j.posted,
    deadline: j.deadline,
    summary: j.summary,
  }));
}

export async function getPublishedInsights(): Promise<Insight[]> {
  const rows = await prisma.insight.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
  });
  return rows.map(mapInsight);
}

export async function getInsight(slug: string): Promise<Insight | null> {
  const row = await prisma.insight.findFirst({ where: { slug, published: true } });
  return row ? mapInsight(row) : null;
}

function mapInsight(n: {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readMins: number;
  accent: string;
  body: unknown;
}): Insight {
  return {
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    category: n.category,
    author: n.author,
    authorRole: n.authorRole,
    date: n.date,
    readMins: n.readMins,
    accent: n.accent,
    body: bodyToHtml(n.body),
  };
}

export async function getResources(): Promise<ResourceView[]> {
  const rows = await prisma.resource.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((r) => ({
    id: r.slug, // preserve the legacy string identifier used by the gate form
    title: r.title,
    type: r.type,
    icon: r.icon, // pass the icon name string; ResourcesGrid resolves it client-side
    description: r.description,
    gate: r.gate as ResourceView["gate"],
    tag: r.tag,
    accent: r.accent,
    fileUrl: r.fileUrl ?? undefined,
    fileName: r.fileName ?? undefined,
  }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const rows = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((t) => ({
    name: t.name,
    role: t.role,
    company: t.company,
    quote: t.quote,
    rating: t.rating,
    initials: t.initials,
  }));
}

function mapPortfolioItem(cs: {
  slug: string;
  client: string;
  industry: string;
  service: string;
  title: string;
  summary: string;
  challenge: string;
  solution: string;
  results: unknown;
  tech: unknown;
  testimonial: unknown;
  related: unknown;
  accent: string;
  thumbnail: string | null;
  sourceUrl: string | null;
}): PortfolioItem {
  return {
    slug: cs.slug,
    client: cs.client,
    industry: cs.industry,
    service: cs.service,
    title: cs.title,
    summary: cs.summary,
    challenge: cs.challenge,
    solution: cs.solution,
    results: cs.results as PortfolioItem["results"],
    tech: cs.tech as string[],
    testimonial: (cs.testimonial as PortfolioItem["testimonial"]) ?? undefined,
    related: cs.related as string[],
    accent: cs.accent,
    thumbnail: cs.thumbnail ?? undefined,
    sourceUrl: cs.sourceUrl ?? undefined,
  };
}

export async function getPortfolio(): Promise<PortfolioItem[]> {
  const rows = await prisma.portfolio.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPortfolioItem);
}

export async function getPortfolioItem(slug: string): Promise<PortfolioItem | null> {
  const row = await prisma.portfolio.findFirst({ where: { slug, published: true } });
  return row ? mapPortfolioItem(row) : null;
}

function mapService(s: {
  slug: string;
  name: string;
  icon: string;
  tagline: string;
  short: string;
  hero: string;
  problem: string;
  outcomes: unknown;
  features: unknown;
  process: unknown;
  faqs: unknown;
  related: unknown;
}): Service {
  return {
    slug: s.slug,
    name: s.name,
    icon: getIcon(s.icon),
    tagline: s.tagline,
    short: s.short,
    hero: s.hero,
    problem: s.problem,
    outcomes: s.outcomes as string[],
    features: s.features as Service["features"],
    process: s.process as Service["process"],
    faqs: s.faqs as Service["faqs"],
    related: s.related as string[],
  };
}

export async function getServices(): Promise<Service[]> {
  const rows = await prisma.service.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapService);
}

export async function getService(slug: string): Promise<Service | null> {
  const row = await prisma.service.findFirst({ where: { slug, published: true } });
  return row ? mapService(row) : null;
}

function mapIndustry(ind: {
  slug: string;
  name: string;
  icon: string;
  short: string;
  hero: string;
  challenges: unknown;
  solutions: unknown;
  useCases: unknown;
  stat: unknown;
  faqs: unknown;
}): Industry {
  return {
    slug: ind.slug,
    name: ind.name,
    icon: getIcon(ind.icon),
    short: ind.short,
    hero: ind.hero,
    challenges: ind.challenges as string[],
    solutions: ind.solutions as Industry["solutions"],
    useCases: ind.useCases as string[],
    stat: ind.stat as Industry["stat"],
    faqs: ind.faqs as Industry["faqs"],
  };
}

export async function getIndustries(): Promise<Industry[]> {
  const rows = await prisma.industry.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapIndustry);
}

export async function getIndustry(slug: string): Promise<Industry | null> {
  const row = await prisma.industry.findFirst({ where: { slug, published: true } });
  return row ? mapIndustry(row) : null;
}

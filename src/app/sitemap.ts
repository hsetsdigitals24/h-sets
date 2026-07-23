import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { services } from "@/data/services";
import { industries } from "@/data/industries";
import { programmes } from "@/data/programmes";
import { portfolioItems } from "@/data/portfolio";
import { insights } from "@/data/insights";

type Entry = MetadataRoute.Sitemap[number];

/**
 * XML sitemap. Priorities and change frequencies are differentiated by page
 * type (money pages > hubs > detail content), and detail pages carry real
 * `lastModified` dates where the source data provides them. New PSEO/location
 * clusters get appended here as those routes ship (see foundation plan).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entry = (
    path: string,
    priority: number,
    changeFrequency: Entry["changeFrequency"],
    lastModified: Date = now
  ): Entry => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });

  const home = entry("", 1, "daily");

  const hubs: Entry[] = [
    ["/services", 0.9],
    ["/ai-solutions", 0.9],
    ["/industries", 0.8],
    ["/academy", 0.9],
    ["/portfolio", 0.7],
    ["/insights", 0.7],
    ["/resources", 0.7],
    ["/about", 0.6],
    ["/careers", 0.6],
    ["/contact", 0.7],
  ].map(([path, p]) => entry(path as string, p as number, "weekly"));

  const servicePages = services.map((s) =>
    entry(`/services/${s.slug}`, 0.8, "monthly")
  );
  const industryPages = industries.map((i) =>
    entry(`/industries/${i.slug}`, 0.7, "monthly")
  );
  const programmePages = programmes.map((p) =>
    entry(`/academy/${p.slug}`, 0.8, "weekly")
  );
  const portfolioPages = portfolioItems.map((c) =>
    entry(`/portfolio/${c.slug}`, 0.6, "monthly")
  );
  const insightPages = insights.map((i) =>
    entry(
      `/insights/${i.slug}`,
      0.6,
      "monthly",
      i.date ? new Date(i.date) : now
    )
  );

  return [
    home,
    ...hubs,
    ...servicePages,
    ...industryPages,
    ...programmePages,
    ...portfolioPages,
    ...insightPages,
  ];
}

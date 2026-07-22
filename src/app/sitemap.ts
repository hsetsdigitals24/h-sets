import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { services } from "@/data/services";
import { industries } from "@/data/industries";
import { programmes } from "@/data/programmes";
import { portfolioItems } from "@/data/portfolio";
import { insights } from "@/data/insights";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/ai-solutions",
    "/industries",
    "/portfolio",
    "/academy",
    "/insights",
    "/resources",
    "/careers",
    "/contact",
  ];

  const dynamic = [
    ...services.map((s) => `/services/${s.slug}`),
    ...industries.map((i) => `/industries/${i.slug}`),
    ...programmes.map((p) => `/academy/${p.slug}`),
    ...portfolioItems.map((c) => `/portfolio/${c.slug}`),
    ...insights.map((i) => `/insights/${i.slug}`),
  ];

  return [...staticRoutes, ...dynamic].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}

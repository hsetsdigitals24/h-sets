import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Crawl directives. Public marketing/academy content is fully crawlable;
 * private dashboards, auth flows, API routes and per-user utility pages are
 * blocked to protect crawl budget and keep non-indexable surfaces out of search.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/account",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify/", // individual certificate lookups — noindex, avoid enumeration
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

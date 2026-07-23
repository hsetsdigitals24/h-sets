import type { Metadata } from "next";
import { site } from "./site";

type BuildMetaInput = {
  /** Page <title> (without the site-name template suffix). */
  title: string;
  description: string;
  /** Absolute path from site root, e.g. "/services/seo". Sets the canonical. */
  path: string;
  /** OG image path/URL. Falls back to the default social card. */
  image?: string;
  /** "website" (default) or "article" for blog/case-study pages. */
  type?: "website" | "article";
  /** Set true to keep a page out of the index (e.g. thin/utility pages). */
  noindex?: boolean;
  /** Optional keyword hints (used sparingly — not a ranking factor, aids clarity). */
  keywords?: string[];
  /** Article-only signals. */
  publishedTime?: string;
  authors?: string[];
};

const DEFAULT_OG_IMAGE = "/og-default.png";

/**
 * Single source of truth for per-page metadata. Guarantees every page gets a
 * self-referencing canonical plus complete Open Graph + Twitter cards — the
 * gaps flagged in the Tier 0 audit. Use inside `generateMetadata`/page exports.
 */
export function buildMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
  keywords,
  publishedTime,
  authors,
}: BuildMetaInput): Metadata {
  const url = `${site.url}${path === "/" ? "" : path}`;
  const ogImage = image.startsWith("http") ? image : `${site.url}${image}`;

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    ...(noindex
      ? { robots: { index: false, follow: true } }
      : {}),
    openGraph: {
      type,
      url,
      siteName: site.name,
      title,
      description,
      locale: "en_NG",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(type === "article" && publishedTime
        ? { publishedTime, authors }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

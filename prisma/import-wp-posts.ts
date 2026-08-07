/**
 * One-off importer: pulls every published post from the H-SETS WordPress site
 * (WP REST API) and upserts it into the `Insight` table so the posts render on
 * /insights like native content.
 *
 * Run:  node --experimental-strip-types prisma/import-wp-posts.ts
 *
 * Idempotent — upserts by slug, so re-running refreshes existing posts rather
 * than duplicating them.
 */
import { PrismaClient } from "@prisma/client";
import sanitizeHtml from "sanitize-html";

const prisma = new PrismaClient();

const WP_API = "https://h-sets.com/wp-json/wp/v2/posts";
const PER_PAGE = 100;

// Reuse the marketing card gradients so imported posts without a featured image
// still get a distinct, on-brand cover.
const ACCENTS = [
  "bg-fuchsia-500",
  "bg-blue-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-indigo-500",
];

type WpRendered = { rendered: string };
type WpPost = {
  id: number;
  slug: string;
  status: string;
  date: string;
  title: WpRendered;
  excerpt: WpRendered;
  content: WpRendered;
  _embedded?: {
    author?: { name?: string }[];
    "wp:featuredmedia"?: { source_url?: string; alt_text?: string }[];
    "wp:term"?: { taxonomy: string; name: string }[][];
  };
};

/** Decode the HTML entities WordPress leaves in titles/excerpts. */
function decodeEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—");
}

/** Strip all tags and collapse whitespace to plain text. */
function toPlainText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** Clean WP excerpt: drop the trailing "[…] Continue reading" cruft, cap length. */
function buildExcerpt(excerptHtml: string, contentHtml: string): string {
  let text = toPlainText(excerptHtml).replace(/\s*\[[…\.]+\]\s*$/, "").trim();
  if (text.length < 10) text = toPlainText(contentHtml);
  if (text.length > 220) text = text.slice(0, 217).replace(/\s+\S*$/, "") + "…";
  return text || "Read this post from the H-SETS blog.";
}

/** ~200 words per minute reading estimate, floored at 1 minute. */
function readingMinutes(contentHtml: string): number {
  const words = toPlainText(contentHtml).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Sanitize WP article HTML into the tag set our prose renderer expects. */
function cleanBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "s", "code", "pre",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "a", "img",
      "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  }).trim();
}

function categoryOf(post: WpPost): string {
  const terms = post._embedded?.["wp:term"] ?? [];
  for (const group of terms) {
    const cat = group.find((t) => t.taxonomy === "category" && t.name && t.name !== "Uncategorized");
    if (cat) return decodeEntities(cat.name);
  }
  return "Insights";
}

async function fetchAllPosts(): Promise<WpPost[]> {
  const all: WpPost[] = [];
  for (let page = 1; ; page++) {
    const url = `${WP_API}?per_page=${PER_PAGE}&page=${page}&_embed&status=publish`;
    const res = await fetch(url);
    if (res.status === 400) break; // WP returns 400 past the last page
    if (!res.ok) throw new Error(`WP API ${res.status} on page ${page}`);
    const batch = (await res.json()) as WpPost[];
    if (batch.length === 0) break;
    all.push(...batch);
    console.log(`  fetched page ${page} (${batch.length} posts, ${all.length} total)`);
    if (batch.length < PER_PAGE) break;
  }
  return all;
}

async function main() {
  console.log("Fetching posts from WordPress…");
  const posts = await fetchAllPosts();
  console.log(`Fetched ${posts.length} posts. Importing…`);

  let created = 0;
  let updated = 0;
  for (const [index, post] of posts.entries()) {
    if (post.status !== "publish") continue;

    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    const coverImage = media?.source_url && /^https?:\/\//.test(media.source_url)
      ? media.source_url
      : null;

    const data = {
      title: decodeEntities(post.title.rendered).trim(),
      excerpt: buildExcerpt(post.excerpt.rendered, post.content.rendered),
      category: categoryOf(post),
      author: decodeEntities(post._embedded?.author?.[0]?.name ?? "H-SETS Team"),
      authorRole: "H-SETS",
      date: post.date.slice(0, 10), // YYYY-MM-DD
      readMins: readingMinutes(post.content.rendered),
      accent: ACCENTS[index % ACCENTS.length],
      coverImage,
      body: cleanBody(post.content.rendered),
      published: true,
    };

    const existing = await prisma.insight.findUnique({ where: { slug: post.slug } });
    await prisma.insight.upsert({
      where: { slug: post.slug },
      create: { slug: post.slug, ...data },
      update: data,
    });
    if (existing) updated++;
    else created++;
  }

  console.log(`Done. ${created} created, ${updated} updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { getPublishedInsights } from "@/lib/content";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { InsightCard } from "@/components/cards/insight-card";
import { CtaStrip } from "@/components/common/cta-strip";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";
import { BreadcrumbSchema } from "@/lib/seo";

/**
 * Build a compact list of page tokens around the current page, e.g.
 * `1 … 4 5 [6] 7 8 … 20`. Always keeps the first and last page; inserts an
 * "ellipsis" token where pages are skipped. `siblings` = pages shown on each
 * side of the current page.
 */
function pageWindow(
  current: number,
  total: number,
  siblings = 1,
): (number | "ellipsis")[] {
  // If everything fits without gaps, just list every page.
  const maxSlots = siblings * 2 + 5; // first, last, current, 2 ellipses
  if (total <= maxSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  const tokens: (number | "ellipsis")[] = [1];
  if (showLeftEllipsis) tokens.push("ellipsis");
  else for (let p = 2; p < left; p++) tokens.push(p);

  for (let p = left; p <= right; p++) {
    if (p !== 1 && p !== total) tokens.push(p);
  }

  if (showRightEllipsis) tokens.push("ellipsis");
  else for (let p = right + 1; p < total; p++) tokens.push(p);

  tokens.push(total);
  return tokens;
}

/**
 * A single pagination control. Renders a real <Link> for reachable pages (so it
 * works without JS and is crawlable) and an inert <span> when disabled.
 */
function PaginationLink({
  href,
  disabled,
  active,
  children,
  ...props
}: {
  href: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const className = cn(
    "inline-flex size-10 items-center justify-center rounded-xl border text-sm font-medium transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card text-foreground hover:border-primary/40 hover:text-primary",
    disabled && "pointer-events-none opacity-40",
  );
  if (disabled) {
    return (
      <span aria-disabled className={className} {...props}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Practical perspectives on technology, AI, design and building a career in tech — from the H-SETS team.",
};

// Reading searchParams opts this route into dynamic rendering, so ISR no longer
// applies. Admin edits already trigger revalidatePath, so freshness is preserved.
const PAGE_SIZE = 6;

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const insights = await getPublishedInsights();
  const [featured, ...rest] = insights;

  // Paginate everything after the featured post.
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const requested = Number((await searchParams).page);
  const page = Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), totalPages)
    : 1;
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = rest.slice(start, start + PAGE_SIZE);
  const pageHref = (p: number) => (p <= 1 ? "/insights" : `/insights?page=${p}`);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Insights", href: "/insights" },
        ]}
      />
      <PageHero
        eyebrow="Insights"
        title={<>Ideas worth <span className="text-gradient">your time</span></>}
        description="Practical perspectives on technology, AI and building a career in tech."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Insights", href: "/insights" },
        ]}
      />

      {/* Featured — first page only */}
      {featured && page === 1 && (
      <Section className="pb-0">
        <Reveal>
          <Link
            href={`/insights/${featured.slug}`}
            className="group grid overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all hover:border-primary/40 lg:grid-cols-2"
          >
            <div className={cn("relative min-h-[240px] overflow-hidden", featured.accent)}>
              {featured.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="absolute inset-0 size-full object-cover"
                />
              )}
              <span className="absolute left-6 top-6">
                <Badge variant="glass">Featured · {featured.category}</Badge>
              </span>
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-10">
              <h2 className="text-2xl font-bold tracking-tight transition-colors group-hover:text-primary sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>
              <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                <span>{featured.author}</span>
                <span>·</span>
                <span>{formatDate(featured.date)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" /> {featured.readMins}m
                </span>
                <ArrowUpRight className="ml-auto size-5 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </Link>
        </Reveal>
      </Section>
      )}

      {/* Grid */}
      <Section>
        <RevealGroup stagger={0.06} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((insight) => (
            <RevealItem key={insight.slug} className="h-full">
              <InsightCard insight={insight} />
            </RevealItem>
          ))}
        </RevealGroup>

        {totalPages > 1 && (
          <nav
            aria-label="Insights pagination"
            className="mt-12 flex items-center justify-center gap-2"
          >
            <PaginationLink
              href={pageHref(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ArrowLeft className="size-4" />
            </PaginationLink>

            {pageWindow(page, totalPages).map((token, i) =>
              token === "ellipsis" ? (
                <span
                  key={`ellipsis-${i}`}
                  aria-hidden
                  className="inline-flex size-10 items-center justify-center text-sm text-muted-foreground"
                >
                  …
                </span>
              ) : (
                <PaginationLink
                  key={token}
                  href={pageHref(token)}
                  active={token === page}
                  aria-label={`Page ${token}`}
                  aria-current={token === page ? "page" : undefined}
                >
                  {token}
                </PaginationLink>
              ),
            )}

            <PaginationLink
              href={pageHref(page + 1)}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <ArrowRight className="size-4" />
            </PaginationLink>
          </nav>
        )}
      </Section>

      <CtaStrip
        title="Want this in your inbox?"
        description="Subscribe for practical insights on technology and career growth — no spam, ever."
        primary={{ label: "Book a consultation", href: "/contact#consultation" }}
        secondary={{ label: "Explore the Academy", href: "/academy" }}
      />
    </>
  );
}

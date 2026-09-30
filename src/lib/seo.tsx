import { site, location, areasServed } from "./site";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Absolute URL helper for schema `@id` / `url` / `image` values. */
function abs(path: string): string {
  if (path.startsWith("http")) return path;
  return `${site.url}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Stable @id anchors so nodes can reference each other across the graph. */
export const ORG_ID = `${site.url}/#organization`;
export const WEBSITE_ID = `${site.url}/#website`;
export const LOCALBUSINESS_ID = `${site.url}/#localbusiness`;

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: location.streetAddress,
  addressLocality: location.addressLocality,
  addressRegion: location.addressRegion,
  postalCode: location.postalCode,
  addressCountry: location.addressCountry,
};

const sameAs = [
  ...Object.values(site.socials),
  ...(location.gbpUrl.startsWith("http") ? [location.gbpUrl] : []),
];

/**
 * Organization node. Rendered once globally (root layout). Enriched with logo,
 * contact point, founder and address so Google can build a knowledge panel and
 * link the brand entity across the graph.
 */
export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": ORG_ID,
        name: site.legalName,
        alternateName: site.name,
        url: site.url,
        logo: abs(site.logo),
        image: abs(site.logo),
        description: site.description,
        email: site.email,
        telephone: site.phone,
        foundingDate: site.foundingYear,
        address: postalAddress,
        areaServed: [...areasServed],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: site.phone,
          email: site.email,
          contactType: "customer service",
          areaServed: "NG",
          availableLanguage: ["en"],
        },
        sameAs,
      }}
    />
  );
}

/**
 * LocalBusiness (ProfessionalService) node for the flagship Ilorin location.
 * Powers local-pack eligibility and "near me" / city intent. Links to the
 * Organization via @id so both describe one entity.
 */
export function LocalBusinessSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": LOCALBUSINESS_ID,
        name: site.legalName,
        image: abs(site.logo),
        url: site.url,
        telephone: site.phone,
        email: site.email,
        priceRange: site.priceRange,
        address: postalAddress,
        geo: {
          "@type": "GeoCoordinates",
          latitude: location.latitude,
          longitude: location.longitude,
        },
        areaServed: [...areasServed],
        openingHours: location.openingHours,
        parentOrganization: { "@id": ORG_ID },
        sameAs,
      }}
    />
  );
}

/**
 * Location-page business node. The office page (`hasAddress`) repeats the full
 * postal address and geo point so the page itself is local-pack eligible; pages
 * for cities we merely serve deliberately omit both and carry only `areaServed`.
 * Claiming a street address in a city with no staffed office is a schema
 * violation and a trust problem the moment anyone checks it.
 */
export function LocationBusinessSchema({
  city,
  region,
  path,
  description,
  hasAddress,
}: {
  city: string;
  region: string;
  path: string;
  description: string;
  hasAddress: boolean;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": hasAddress ? "ProfessionalService" : "Organization",
        "@id": `${abs(path)}#business`,
        name: `${site.legalName} — ${city}`,
        url: abs(path),
        image: abs(site.logo),
        telephone: site.phone,
        email: site.email,
        description,
        ...(hasAddress
          ? {
              priceRange: site.priceRange,
              address: postalAddress,
              geo: {
                "@type": "GeoCoordinates",
                latitude: location.latitude,
                longitude: location.longitude,
              },
              openingHours: location.openingHours,
              hasMap: location.gbpUrl,
            }
          : {}),
        areaServed: [
          { "@type": "City", name: city },
          { "@type": "AdministrativeArea", name: region },
        ],
        parentOrganization: { "@id": ORG_ID },
        sameAs,
      }}
    />
  );
}

export function WebsiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: site.name,
        url: site.url,
        publisher: { "@id": ORG_ID },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${site.url}/insights?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: abs(item.href),
        })),
      }}
    />
  );
}

export function FaqSchema({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }}
    />
  );
}

/**
 * Service node. Optionally carries area served, a canonical url and an
 * AggregateRating when review data is present, and links to the provider org.
 */
export function ServiceSchema({
  name,
  description,
  url,
  areaServed = [...areasServed],
  rating,
}: {
  name: string;
  description: string;
  url?: string;
  areaServed?: string[];
  rating?: { value: number; count: number };
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: name,
        name,
        description,
        ...(url ? { url: abs(url) } : {}),
        provider: { "@id": ORG_ID },
        areaServed,
        ...(rating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: rating.value,
                reviewCount: rating.count,
              },
            }
          : {}),
      }}
    />
  );
}

export function CourseSchema({
  name,
  description,
  url,
  price,
  priceCurrency = "NGN",
  durationWeeks,
  instances,
}: {
  name: string;
  description: string;
  url?: string;
  /** Full programme fee. Google requires an offer before a Course is rich-result eligible. */
  price?: number;
  priceCurrency?: string;
  durationWeeks?: number;
  /** Upcoming cohorts, surfaced as CourseInstance nodes. */
  instances?: { startDate: string; endDate: string; format: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Course",
        name,
        description,
        ...(url ? { url: abs(url) } : {}),
        provider: {
          "@type": "EducationalOrganization",
          name: `${site.name} Academy`,
          url: `${site.url}/academy`,
          sameAs: site.url,
        },
        ...(price !== undefined
          ? {
              offers: {
                "@type": "Offer",
                price: String(price),
                priceCurrency,
                category: "Paid",
                availability: "https://schema.org/InStock",
                ...(url ? { url: abs(url) } : {}),
              },
            }
          : {}),
        ...(instances?.length
          ? {
              hasCourseInstance: instances.map((c) => ({
                "@type": "CourseInstance",
                courseMode: "Blended",
                startDate: c.startDate,
                endDate: c.endDate,
                ...(durationWeeks
                  ? { courseWorkload: `P${durationWeeks}W` }
                  : {}),
                name: `${name} — ${c.format} cohort`,
              })),
            }
          : {}),
      }}
    />
  );
}

export function ArticleSchema({
  title,
  description,
  author,
  date,
  dateModified,
  image,
  url,
  authorUrl,
  authorSameAs,
  section,
}: {
  title: string;
  description: string;
  author: string;
  date: string;
  /** Falls back to `date` — Google treats a missing dateModified as stale. */
  dateModified?: string;
  image?: string;
  url?: string;
  /** Author's profile page (our /about anchor), so the byline resolves to an entity. */
  authorUrl?: string;
  authorSameAs?: string[];
  section?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        // Always emit an image: Article is not rich-result eligible without one,
        // and the /og route renders a branded card for posts with no cover.
        image: abs(image ?? `/og?title=${encodeURIComponent(title)}`),
        ...(url ? { mainEntityOfPage: { "@type": "WebPage", "@id": abs(url) } } : {}),
        ...(section ? { articleSection: section } : {}),
        author: {
          "@type": "Person",
          name: author,
          ...(authorUrl ? { url: abs(authorUrl) } : {}),
          ...(authorSameAs?.length ? { sameAs: authorSameAs } : {}),
          worksFor: { "@id": ORG_ID },
        },
        datePublished: date,
        dateModified: dateModified ?? date,
        publisher: { "@id": ORG_ID },
      }}
    />
  );
}

/** Aggregated review stars for a page (service/programme with testimonials). */
export function AggregateRatingSchema({
  itemName,
  value,
  count,
}: {
  itemName: string;
  value: number;
  count: number;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "AggregateRating",
        itemReviewed: { "@type": "Organization", name: itemName },
        ratingValue: value,
        reviewCount: count,
      }}
    />
  );
}

/** Individual review markup (testimonial). */
export function ReviewSchema({
  author,
  body,
  rating = 5,
}: {
  author: string;
  body: string;
  rating?: number;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Review",
        reviewBody: body,
        author: { "@type": "Person", name: author },
        reviewRating: {
          "@type": "Rating",
          ratingValue: rating,
          bestRating: 5,
        },
        itemReviewed: { "@id": ORG_ID },
      }}
    />
  );
}

/** Person / expert profile (team + instructors). */
export function PersonSchema({
  name,
  jobTitle,
  description,
  image,
  url,
  sameAs: personSameAs,
}: {
  name: string;
  jobTitle: string;
  description?: string;
  image?: string;
  url?: string;
  sameAs?: string[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        jobTitle,
        ...(description ? { description } : {}),
        ...(image ? { image: abs(image) } : {}),
        ...(url ? { url: abs(url) } : {}),
        worksFor: { "@id": ORG_ID },
        ...(personSameAs?.length ? { sameAs: personSameAs } : {}),
      }}
    />
  );
}

/**
 * Job board listing. The board carries partner vacancies as well as our own, so
 * `hiringOrganization` must name the company that is actually hiring — claiming
 * H-SETS hires for every listing would be a false structured-data statement.
 */
export function JobPostingSchema({
  title,
  description,
  datePosted,
  validThrough,
  employmentType,
  hiringOrganization,
  location: jobLocation,
  url,
  remote = false,
}: {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string;
  hiringOrganization?: string;
  location?: string;
  url?: string;
  remote?: boolean;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title,
        description,
        datePosted,
        ...(validThrough ? { validThrough } : {}),
        ...(employmentType ? { employmentType } : {}),
        ...(url ? { url: abs(url) } : {}),
        hiringOrganization: hiringOrganization
          ? { "@type": "Organization", name: hiringOrganization }
          : { "@id": ORG_ID },
        ...(remote
          ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "Nigeria" } }
          : {}),
        jobLocation: {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: jobLocation ?? location.addressLocality,
            addressRegion: location.addressRegion,
            addressCountry: location.addressCountry,
          },
        },
      }}
    />
  );
}

/** Event / webinar. */
export function EventSchema({
  name,
  description,
  startDate,
  endDate,
  url,
  online = true,
}: {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  url?: string;
  online?: boolean;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Event",
        name,
        description,
        startDate,
        ...(endDate ? { endDate } : {}),
        eventAttendanceMode: online
          ? "https://schema.org/OnlineEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
        ...(url ? { url: abs(url) } : {}),
        organizer: { "@id": ORG_ID },
      }}
    />
  );
}

/** Knowledge-base glossary term. */
export function DefinedTermSchema({
  term,
  definition,
  url,
}: {
  term: string;
  definition: string;
  url?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        name: term,
        description: definition,
        ...(url ? { url: abs(url) } : {}),
        inDefinedTermSet: {
          "@type": "DefinedTermSet",
          name: `${site.name} Knowledge Base`,
          url: `${site.url}/knowledge`,
        },
      }}
    />
  );
}

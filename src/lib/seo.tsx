import { site } from "./site";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.legalName,
        alternateName: site.name,
        url: site.url,
        description: site.description,
        email: site.email,
        sameAs: Object.values(site.socials),
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
        name: site.name,
        url: site.url,
        potentialAction: {
          "@type": "SearchAction",
          target: `${site.url}/insights?q={search_term_string}`,
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
          item: `${site.url}${item.href}`,
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

export function ServiceSchema({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: name,
        provider: { "@type": "Organization", name: site.legalName },
        areaServed: "NG",
        description,
      }}
    />
  );
}

export function CourseSchema({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Course",
        name,
        description,
        provider: {
          "@type": "EducationalOrganization",
          name: `${site.name} Academy`,
          sameAs: site.url,
        },
      }}
    />
  );
}

export function ArticleSchema({
  title,
  description,
  author,
  date,
}: {
  title: string;
  description: string;
  author: string;
  date: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        author: { "@type": "Person", name: author },
        datePublished: date,
        publisher: { "@type": "Organization", name: site.legalName },
      }}
    />
  );
}

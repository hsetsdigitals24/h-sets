import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal } from "@/components/common/reveal";
import { ContactForm } from "@/components/forms/contact-form";
import { ConsultationForm } from "@/components/forms/consultation-form";
import Link from "next/link";
import { site, fullAddress, location } from "@/lib/site";
import { BreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with H-SETS. Book a free consultation, send an enquiry, or explore partnership opportunities.",
  path: "/contact",
});

const details = [
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone}` },
  {
    icon: MapPin,
    label: "Office",
    value: fullAddress,
    // Opens the Google Business Profile — the same listing the schema and the
    // footer NAP point at, so a visitor can confirm the address independently.
    href: location.gbpUrl,
  },
  { icon: Clock, label: "Hours", value: "Mon–Fri, 9am–6pm WAT" },
];

export default function ContactPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />
      <PageHero
        eyebrow="Contact"
        title={<>Let&apos;s build something <span className="text-gradient">together</span></>}
        description="Whether you're transforming a business or starting a tech career, we'd love to hear from you."
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
      />

      {/* Enquiry */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <h2 className="text-2xl font-bold tracking-tight">Send us a message</h2>
            <p className="mt-3 text-muted-foreground">
              Fill in the form and we&apos;ll get back to you within one business day. Prefer
              a call? Book a free consultation below.
            </p>
            <ul className="mt-8 space-y-5">
              {details.map((d) => {
                const Icon = d.icon;
                return (
                  <li key={d.label} className="flex items-start gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm text-muted-foreground">{d.label}</span>
                      {d.href ? (
                        <a href={d.href} className="font-medium hover:text-primary">
                          {d.value}
                        </a>
                      ) : (
                        <span className="font-medium">{d.value}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          <Reveal direction="left" className="lg:col-span-3">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </Section>

      {/* Consultation booking */}
      <Section id="consultation" className="scroll-mt-24 bg-secondary/40">
        <SectionHeading
          eyebrow="Book a call"
          title="Schedule a free consultation"
          description="Pick a session type and a time that works for you. You'll get an instant confirmation and calendar invite."
        />
        <Reveal className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-10">
            <ConsultationForm />
          </div>
        </Reveal>
      </Section>

      {/* Visit us — full NAP plus a map, so the address on this page, the
          LocalBusiness schema and the Google Business Profile all agree. */}
      <Section>
        <SectionHeading
          eyebrow="Visit us"
          title="Our office in Ilorin"
          description="Walk-ins are welcome — call ahead so the right person is free to see you."
        />
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <address className="not-italic">
              <p className="font-semibold">{site.legalName}</p>
              <p className="mt-2 leading-relaxed text-muted-foreground">{fullAddress}</p>
              <p className="mt-4 text-sm text-muted-foreground">
                <a href={`tel:${site.phone.replace(/\s+/g, "").split("/")[0]}`} className="hover:text-primary">
                  {site.phone}
                </a>
                <br />
                <a href={`mailto:${site.email}`} className="hover:text-primary">
                  {site.email}
                </a>
              </p>
            </address>
            <p className="mt-4 text-sm text-muted-foreground">
              Monday–Friday, 9:00–17:00 WAT
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
              <a
                href={location.gbpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Open in Google Maps
              </a>
              <Link href="/locations/ilorin" className="text-primary hover:underline">
                What we do in Ilorin
              </Link>
            </div>
          </Reveal>
          <Reveal direction="left" className="lg:col-span-3">
            <div className="overflow-hidden rounded-3xl border border-border shadow-soft">
              <iframe
                title="Map showing the H-SETS office at Kulende Estate, Sango, Ilorin, Kwara State"
                src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
                width="100%"
                height="420"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block border-0"
              />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}

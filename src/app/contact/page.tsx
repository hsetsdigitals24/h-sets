import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { PageHero } from "@/components/common/page-hero";
import { Section, SectionHeading } from "@/components/common/section";
import { Reveal } from "@/components/common/reveal";
import { ContactForm } from "@/components/forms/contact-form";
import { ConsultationForm } from "@/components/forms/consultation-form";
import { site } from "@/lib/site";
import { BreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with H-SETS. Book a free consultation, send an enquiry, or explore partnership opportunities.",
};

const details = [
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone}` },
  { icon: MapPin, label: "Location", value: site.address },
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
    </>
  );
}

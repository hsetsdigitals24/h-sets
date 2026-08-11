import type { Metadata } from "next";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { BreadcrumbSchema } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that govern your use of the H-SETS website, academy and services.",
};

const LAST_UPDATED = "August 2026";

export default function TermsPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Terms & Conditions", href: "/terms" },
        ]}
      />
      <PageHero
        eyebrow="Legal"
        title={
          <>
            Terms &amp; <span className="text-gradient">Conditions</span>
          </>
        }
        description={`The terms that govern your use of our website and services. Last updated ${LAST_UPDATED}.`}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Terms & Conditions", href: "/terms" },
        ]}
      />
      <Section>
        <div className="prose prose-lg max-w-3xl text-foreground/90 prose-headings:text-foreground prose-a:text-primary">
          <p>
            These Terms &amp; Conditions govern your access to and use of the{" "}
            {site.legalName} (&ldquo;{site.name}&rdquo;) website, academy and
            services. By using our platform you agree to these terms.
          </p>

          <h2>Use of the platform</h2>
          <p>
            You agree to use the platform lawfully and not to misuse it,
            interfere with its operation, or attempt to access areas or data you
            are not authorised to. You are responsible for keeping your account
            credentials secure and for activity under your account.
          </p>

          <h2>Academy enrollment</h2>
          <ul>
            <li>
              Enrollment in a programme is confirmed once your application is
              approved and the applicable fee (or first installment) is received.
            </li>
            <li>
              Access to course materials is for your personal, non-transferable
              use. Content may not be copied, resold or redistributed without our
              written permission.
            </li>
            <li>
              Certificates are issued only when the published eligibility
              criteria — attendance, assignment completion and assessment score —
              are met.
            </li>
          </ul>

          <h2>Payments</h2>
          <p>
            Fees are payable in Nigerian Naira through our approved payment
            partners. Where an installment plan is offered, each installment must
            be paid by its due date to retain access. All fees are quoted
            inclusive of applicable taxes unless stated otherwise.
          </p>

          <h2>Refunds</h2>
          <p>
            Refund requests made within 7 days of payment and before a cohort
            starts are eligible for an 80% refund. After a cohort has started, no
            cash refund is available, but a credit toward a future cohort may be
            granted. All refunds require approval and are processed to the
            original payment method.
          </p>

          <h2>Intellectual property</h2>
          <p>
            All content on the platform — including text, graphics, logos, course
            materials and software — is owned by or licensed to {site.name} and is
            protected by applicable intellectual property laws. Work you submit
            (such as assignments and projects) remains yours; you grant us a
            limited licence to use it for grading, feedback and, with your
            consent, promotion.
          </p>

          <h2>Services &amp; consultations</h2>
          <p>
            Any professional services are governed by a separate written proposal
            or agreement. Information on this website is provided for general
            purposes and does not constitute a binding offer.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            The platform is provided &ldquo;as is&rdquo;. To the fullest extent
            permitted by law, {site.name} is not liable for any indirect or
            consequential loss arising from your use of the platform.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the
            platform after changes take effect constitutes acceptance of the
            revised terms.
          </p>

          <h2>Contact us</h2>
          <p>
            Questions about these terms? Email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> or write to us at{" "}
            {site.address}.
          </p>
        </div>
      </Section>
    </>
  );
}

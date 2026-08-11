import type { Metadata } from "next";
import { PageHero } from "@/components/common/page-hero";
import { Section } from "@/components/common/section";
import { BreadcrumbSchema } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How H-SETS collects, uses and protects your personal data across our website, academy and services.",
};

const LAST_UPDATED = "August 2026";

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", href: "/" },
          { name: "Privacy Policy", href: "/privacy" },
        ]}
      />
      <PageHero
        eyebrow="Legal"
        title={
          <>
            Privacy <span className="text-gradient">Policy</span>
          </>
        }
        description={`How we collect, use and protect your personal data. Last updated ${LAST_UPDATED}.`}
        breadcrumbs={[
          { name: "Home", href: "/" },
          { name: "Privacy Policy", href: "/privacy" },
        ]}
      />
      <Section>
        <div className="prose prose-lg max-w-3xl text-foreground/90 prose-headings:text-foreground prose-a:text-primary">
          <p>
            {site.legalName} (&ldquo;{site.name}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;)
            respects your privacy. This policy explains what personal data we
            collect when you use our website, academy and services, how we use
            it, and the rights you have. It is intended to comply with the
            Nigeria Data Protection Act (NDPA) 2023.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Details you give us</strong> — such as your name, email,
              phone number, company and any message when you contact us, book a
              consultation, download a resource, or apply to an academy
              programme.
            </li>
            <li>
              <strong>Account &amp; learning data</strong> — for enrolled
              students: enrollment records, assignments, grades, attendance and
              certificates.
            </li>
            <li>
              <strong>Usage data</strong> — pages visited, device and browser
              information, and similar analytics collected via cookies and tools
              such as Google Analytics.
            </li>
          </ul>

          <h2>How we use your data</h2>
          <ul>
            <li>To respond to enquiries and deliver the services you request.</li>
            <li>To operate the academy — enrollment, learning, grading and certification.</li>
            <li>To process payments and send receipts and invoices.</li>
            <li>
              To send service updates and, where you have opted in, marketing
              and educational content. You can unsubscribe at any time.
            </li>
            <li>To improve our website, measure performance and keep the platform secure.</li>
          </ul>

          <h2>Legal basis</h2>
          <p>
            We process personal data on the basis of your consent, to perform a
            contract with you, to meet legal obligations, and for our legitimate
            interests in operating and improving our business.
          </p>

          <h2>Sharing your data</h2>
          <p>
            We do not sell your personal data. We share it only with trusted
            service providers who help us operate the platform — for example
            payment gateways (Paystack, Flutterwave), email delivery and
            analytics providers — and where required by law. Card details are
            handled entirely by our PCI-DSS-compliant payment partners and are
            never stored on our servers.
          </p>

          <h2>Data retention</h2>
          <p>
            We keep personal data only for as long as needed for the purposes
            described here or as required by law, after which it is deleted or
            anonymised.
          </p>

          <h2>Your rights</h2>
          <p>
            You may request access to, correction of, or deletion of your
            personal data, object to certain processing, and withdraw consent at
            any time. To exercise these rights, contact us using the details
            below.
          </p>

          <h2>Cookies</h2>
          <p>
            We use cookies to keep you signed in, remember preferences and
            understand how the site is used. You can control cookies through your
            browser settings; disabling some may affect how the site works.
          </p>

          <h2>Contact us</h2>
          <p>
            Questions about this policy or your data? Email{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a> or write to us at{" "}
            {site.address}.
          </p>
        </div>
      </Section>
    </>
  );
}

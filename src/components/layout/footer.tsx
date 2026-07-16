import Link from "next/link";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";
import { footerNav, site } from "@/lib/site";
import { Logo } from "./logo";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { LinkedInIcon, XIcon, InstagramIcon, YouTubeIcon } from "./social-icons";

const socialIcons = [
  { icon: LinkedInIcon, href: site.socials.linkedin, label: "LinkedIn" },
  { icon: XIcon, href: site.socials.twitter, label: "X (Twitter)" },
  { icon: InstagramIcon, href: site.socials.instagram, label: "Instagram" },
  { icon: YouTubeIcon, href: site.socials.youtube, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-gradient text-white">
      <div className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="lg:col-span-4">
            <Logo light />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {site.description}
            </p>

            <div className="mt-6">
              <p className="text-sm font-medium text-white">Get insights in your inbox</p>
              <p className="mb-3 text-xs text-white/60">
                No spam. Unsubscribe anytime.
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-6">
            {footerNav.map((col) => (
              <div key={col.heading}>
                <p className="mb-4 text-sm font-semibold text-white">{col.heading}</p>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/65 transition-colors hover:text-accent"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <p className="mb-4 text-sm font-semibold text-white">Get in touch</p>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-accent" />
                <a href={`mailto:${site.email}`} className="hover:text-accent">
                  {site.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{site.address}</span>
              </li>
            </ul>
            <Link
              href="/contact#consultation"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              Book a consultation
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/55">
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {socialIcons.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-9 place-items-center rounded-full border border-white/15 text-white/70 transition-all hover:border-accent hover:text-accent hover:-translate-y-0.5"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
          <div className="flex gap-5 text-xs text-white/55">
            <Link href="/contact" className="hover:text-accent">Privacy</Link>
            <Link href="/contact" className="hover:text-accent">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

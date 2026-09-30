"use client";

import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

/**
 * Per-path opening message. Nigerian B2B buyers overwhelmingly open WhatsApp
 * before they will fill in a form, so the button is present on every marketing
 * page — and the pre-filled text carries the page context so the sales reply
 * starts with something to work from instead of "Hi".
 */
function contextMessage(pathname: string): string {
  if (pathname.startsWith("/academy")) {
    return "Hi H-SETS — I'd like to know more about the Academy programmes and the next cohort.";
  }
  if (pathname.startsWith("/services/")) {
    const slug = pathname.split("/")[2] ?? "";
    const service = slug.replace(/-/g, " ");
    return `Hi H-SETS — I'd like to talk about ${service} for my business.`;
  }
  if (pathname.startsWith("/ai-solutions")) {
    return "Hi H-SETS — I'd like to discuss AI automation for my business.";
  }
  if (pathname.startsWith("/locations/")) {
    const city = (pathname.split("/")[2] ?? "").replace(/-/g, " ");
    return `Hi H-SETS — I'm in ${city} and I'd like to discuss a project.`;
  }
  if (pathname.startsWith("/industries/")) {
    const industry = (pathname.split("/")[2] ?? "").replace(/-/g, " ");
    return `Hi H-SETS — I work in ${industry} and I'd like to discuss a project.`;
  }
  if (pathname.startsWith("/careers")) {
    return "Hi H-SETS — I have a question about a role on your careers page.";
  }
  return "Hi H-SETS — I'd like to talk about a project.";
}

/** Floating WhatsApp CTA. Hidden on /contact, where the form is the CTA. */
export function WhatsAppFloat() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/contact")) return null;

  const href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(
    contextMessage(pathname)
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with H-SETS on WhatsApp"
      onClick={() => {
        // GA4 conversion event. `gtag` is absent until NEXT_PUBLIC_GA_ID is set,
        // so the click must never depend on it existing.
        window.gtag?.("event", "whatsapp_click", {
          page_path: pathname,
          transport_type: "beacon",
        });
      }}
      className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 motion-safe:animate-none sm:bottom-7 sm:right-7"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.36.101 11.945c0 2.096.549 4.142 1.595 5.945L0 24l6.305-1.654a11.9 11.9 0 0 0 5.73 1.459h.005c6.585 0 11.946-5.36 11.949-11.945a11.9 11.9 0 0 0-3.47-8.411" />
      </svg>
    </a>
  );
}

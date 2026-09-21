import { ChevronDown } from "lucide-react";
import { Section, SectionHeading } from "./section";
import { Reveal } from "./reveal";

/**
 * FAQ accordion built on native <details>/<summary> rather than the Radix
 * accordion.
 *
 * Radix only renders a panel's children while it is open (`children: isOpen &&
 * children` in react-collapsible) — even with `forceMount`. That left every FAQ
 * answer out of the server-rendered HTML, so the Sept 2026 audit read these
 * sections as "questions with empty answers" and the FAQPage JSON-LD claimed
 * text no crawler could see on the page.
 *
 * <details> keeps every answer in the markup, works with no JS, and gives
 * keyboard and screen-reader behaviour for free.
 */
export function FaqSection({
  faqs,
  title = "Frequently asked questions",
  eyebrow = "FAQs",
}: {
  faqs: { q: string; a: string }[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <Section className="bg-secondary/40">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <Reveal className="mt-10">
          <div className="w-full">
            {faqs.map((f, i) => (
              <details key={i} className="group border-b border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-md py-5 text-left text-base font-medium transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="pb-5 pr-8 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

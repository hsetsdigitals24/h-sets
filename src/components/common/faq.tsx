import { Section, SectionHeading } from "./section";
import { Reveal } from "./reveal";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

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
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </Section>
  );
}

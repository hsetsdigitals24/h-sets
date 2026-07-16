import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "./section";
import { Reveal } from "./reveal";
import { Button } from "@/components/ui/button";

export function CtaStrip({
  title = "Ready to grow your business or start your tech career?",
  description = "Whether you're transforming a business or launching a career in tech, we're your end-to-end partner.",
  primary = { label: "Book a Free Consultation", href: "/contact#consultation" },
  secondary = { label: "Explore Programmes", href: "/academy" },
}: {
  title?: string;
  description?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="px-5 py-10 sm:px-8">
      <Container className="px-0">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink-gradient px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute -left-10 top-0 size-72 rounded-full bg-primary/30 blur-3xl animate-float-slow" />
            <div className="pointer-events-none absolute -right-10 bottom-0 size-72 rounded-full bg-accent/20 blur-3xl animate-float-slow [animation-delay:-6s]" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {title}
              </h2>
              <p className="mt-4 text-lg text-white/70">{description}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild variant="gradient" size="lg">
                  <Link href={primary.href}>
                    {primary.label}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outlineLight" size="lg">
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

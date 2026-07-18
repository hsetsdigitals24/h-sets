import Link from "next/link";
import { Home, ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const quickLinks = [
  { label: "Services", href: "/services" },
  { label: "Academy", href: "/academy" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Insights", href: "/insights" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ink-gradient px-5 py-24 text-center text-white">
      <div className="pointer-events-none absolute -left-24 top-10 size-96 rounded-full bg-primary/25 blur-[120px] animate-float-slow" />
      <div className="pointer-events-none absolute -right-24 bottom-10 size-96 rounded-full bg-accent/15 blur-[120px] animate-float-slow [animation-delay:-6s]" />

      <div className="relative mx-auto max-w-xl">
        <p className="font-display text-[6rem] font-bold leading-none text-gradient sm:text-[9rem]">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">This page wandered off</h1>
        <p className="mx-auto mt-3 max-w-md text-white/70">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you
          back on track.
        </p>

        {/* Search */}
        <form action="/insights" className="mx-auto mt-8 flex max-w-md gap-2">
          <input
            type="search"
            name="q"
            placeholder="Search insights & resources…"
            aria-label="Search"
            className="h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="submit" variant="gradient" size="lg">
            Search
          </Button>
        </form>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="light" size="lg">
            <Link href="/">
              <Home className="size-4" />
              Back home
            </Link>
          </Button>
          <Button asChild variant="outlineLight" size="lg">
            <Link href="/contact">
              Contact us
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* Quick links */}
        <div className="mt-10">
          <p className="mb-3 inline-flex items-center gap-2 text-sm text-white/50">
            <Compass className="size-4" /> Popular pages
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 transition-colors hover:border-accent hover:text-accent"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./section";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

type Crumb = { name: string; href: string };

/** Dark gradient inner-page header that sits behind the fixed transparent nav. */
export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: Crumb[];
  children?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden bg-ink-gradient text-white", className)}>
      {/* aurora blobs */}
      <div className="pointer-events-none absolute -left-24 top-0 size-80 rounded-full bg-primary/25 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute right-0 top-20 size-72 rounded-full bg-accent/15 blur-3xl animate-float-slow [animation-delay:-5s]" />

      <Container
        className={cn(
          "relative pb-16 pt-28 sm:pb-20 sm:pt-36",
          align === "center" && "flex flex-col items-center text-center"
        )}
      >
        {breadcrumbs && (
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-white/55">
                {breadcrumbs.map((c, i) => (
                  <li key={c.href} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="size-3.5" />}
                    {i === breadcrumbs.length - 1 ? (
                      <span className="text-white/80">{c.name}</span>
                    ) : (
                      <Link href={c.href} className="transition-colors hover:text-accent">
                        {c.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
        )}

        {eyebrow && (
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              {eyebrow}
            </span>
          </Reveal>
        )}

        <Reveal delay={0.05}>
          <h1
            className={cn(
              "mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl",
              align === "center" && "mx-auto"
            )}
          >
            {title}
          </h1>
        </Reveal>

        {description && (
          <Reveal delay={0.1}>
            <p
              className={cn(
                "mt-5 max-w-2xl text-lg leading-relaxed text-white/70",
                align === "center" && "mx-auto"
              )}
            >
              {description}
            </p>
          </Reveal>
        )}

        {children && (
          <Reveal delay={0.15} className="mt-8">
            {children}
          </Reveal>
        )}
      </Container>
    </section>
  );
}

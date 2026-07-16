"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { Section, SectionHeading } from "@/components/common/section";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const count = testimonials.length;

  const go = React.useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [paused, count]);

  const t = testimonials[index];

  return (
    <Section className="bg-secondary/40">
      <SectionHeading
        eyebrow="Testimonials"
        title="Trusted by businesses and graduates alike"
        description="Real words from the clients we've transformed and the careers we've launched."
      />

      <div
        className="relative mx-auto mt-14 max-w-3xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft sm:p-12">
          <Quote className="absolute right-8 top-8 size-16 text-primary/10" />
          <AnimatePresence mode="wait">
            <motion.figure
              key={index}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="size-5 fill-star text-star" />
                ))}
              </div>
              <blockquote className="mt-5 text-lg leading-relaxed text-foreground sm:text-xl">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-full bg-brand-gradient font-semibold text-white">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.role} · {t.company}
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition-all hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-6 bg-primary" : "w-2 bg-border hover:bg-primary/50"
                )}
              />
            ))}
          </div>
          <button
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground transition-all hover:border-primary hover:text-primary"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </Section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/common/animated-counter";
import { stats } from "@/data/company";

const headline = ["Technology", "that grows", "your business"];

const slides = [
  { src: "/hero/slide-1.png", alt: "H-SETS team building software" },
  { src: "/hero/slide-2.png", alt: "H-SETS Academy learners at work" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: "100%" },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || slides.length < 2) return;

    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink pt-24 text-white"
      style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 5rem))" }}
    >
      {/* background image slider */}
      <div className="pointer-events-none absolute inset-0">
        {slides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            preload={i === 0}
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* dark overlay for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-ink/70" />

      <div className="relative mx-auto w-full max-w-4xl px-5 py-16 text-center sm:px-8">
        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl"
        >
          {headline.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-1">
              <motion.span
                variants={word}
                className={i >= 2 ? "inline-block text-gradient" : "inline-block"}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-white/70 sm:text-xl"
        >
          We build software, deploy AI and drive growth for ambitious businesses — and
          train the next generation of tech talent through the H-SETS Academy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button asChild variant="gradient" size="lg">
            <Link href="/contact#consultation">
              Get Free Consultation
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outlineLight" size="lg">
            <Link href="/academy">Explore the Academy</Link>
          </Button>
        </motion.div>

        {/* Trust stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/10 pt-8"
        >
          {stats.slice(0, 3).map((s) => (
            <div key={s.label}>
              <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                <AnimatedCounter value={s.value} suffix={s.suffix} prefix={s.prefix} />
              </div>
              <p className="mt-1 text-xs text-white/60 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

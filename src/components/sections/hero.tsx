"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ArrowRight, Sparkles, Code2, Bot, GraduationCap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/common/animated-counter";
import { stats } from "@/data/company";

const headline = ["Technology", "that grows", "your business", "and your career."];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: "100%" },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const floatingCards = [
  { icon: Code2, label: "Software", className: "left-[2%] top-[18%]", delay: 0 },
  { icon: Bot, label: "AI Agents", className: "right-[4%] top-[12%]", delay: -3 },
  { icon: GraduationCap, label: "Academy", className: "left-[8%] bottom-[16%]", delay: -6 },
  { icon: BarChart3, label: "Growth", className: "right-[6%] bottom-[20%]", delay: -2 },
];

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink-gradient pt-24 text-white" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - 5rem))" }}>
      {/* aurora blobs */}
      {/* <div className="pointer-events-none absolute -left-32 top-10 size-[28rem] rounded-full bg-primary/30 blur-[120px] animate-float-slow" />
      <div className="pointer-events-none absolute -right-32 top-1/3 size-[26rem] rounded-full bg-accent/20 blur-[120px] animate-float-slow [animation-delay:-7s]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 size-[24rem] -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-[120px] animate-float-slow [animation-delay:-3s]" /> */}
      {/* grid texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* floating service chips (desktop) */}
      {/* {floatingCards.map((c) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + Math.abs(c.delay) * 0.03, duration: 0.6 }}
            className={`absolute hidden lg:block ${c.className}`}
          >
            <div className="animate-float-slow" style={{ animationDelay: `${c.delay}s` }}>
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 shadow-soft backdrop-blur-md">
                <span className="grid size-8 place-items-center rounded-lg bg-brand-gradient">
                  <Icon className="size-3 text-white" />
                </span>
                <span className="text-sm font-medium">{c.label}</span>
              </div>
            </div>
          </motion.div>
        ); 
      })}*/}

      <div className="relative mx-auto w-full max-w-4xl px-5 py-16 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/80 backdrop-blur"
        >
          {/* <Sparkles className="size-4 text-accent" /> */}
          Nigeria&apos;s end-to-end technology growth partner
        </motion.div>

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

      {/* bottom fade */}
      {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" /> */}
    </section>
  );
}

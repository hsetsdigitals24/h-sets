import { CheckCircle2 } from "lucide-react";
import { Section } from "@/components/common/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/common/reveal";
import { AnimatedCounter } from "@/components/common/animated-counter";
import { aboutStats } from "@/data/company";
import { clientLogos } from "@/data/testimonials";

const points = [
  "Senior team that's shipped for fintech, health and enterprise",
  "Outcome-driven — we measure success by your results",
  "Built for the Nigerian market, to a global standard",
];

export function WhyHsets() {
  return (
    <Section className="bg-ink-gradient text-white">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-accent">
              <span className="h-px w-6 bg-current opacity-60" /> Why H-SETS
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              A track record you can build on
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/70">
              We&apos;ve spent years delivering technology that moves the needle — for
              businesses transforming their operations and for individuals launching
              careers in tech.
            </p>
          </Reveal>
          <RevealGroup stagger={0.08} className="mt-6 space-y-3">
            {points.map((p) => (
              <RevealItem key={p} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                <span className="text-white/85">{p}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <RevealGroup stagger={0.1} className="grid grid-cols-2 gap-5">
          {aboutStats.map((s) => (
            <RevealItem key={s.label}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="font-display text-4xl font-bold text-gradient">
                  <AnimatedCounter value={s.value} suffix={s.suffix} prefix={s.prefix} />
                </div>
                <p className="mt-2 text-sm text-white/70">{s.label}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>

      {/* Logo marquee */}
      <Reveal className="mt-16">
        <p className="text-center text-sm text-white/50">
          Trusted by teams across Nigeria and beyond
        </p>
        <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-12">
            {[...clientLogos, ...clientLogos].map((logo, i) => (
              <span
                key={i}
                className="whitespace-nowrap font-display text-xl font-semibold text-white/40"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

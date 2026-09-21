"use client";

import * as React from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  motion,
} from "motion/react";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

function format(n: number, prefix: string, suffix: string, decimals: number) {
  return `${prefix}${n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

/**
 * Counts up to `value` when scrolled into view — but renders the *final* value
 * on the server and on first paint.
 *
 * The previous version seeded its motion value at 0 and only reached the real
 * figure inside a client effect, so the server-rendered HTML read
 * "0+ Projects Delivered". That is what crawlers, social scrapers and anyone
 * with JS disabled saw, and it was flagged in the Sept 2026 SEO audit as the
 * site's most visible trust failure.
 *
 * The count-up is decided once at mount: only counters that start *below* the
 * viewport animate. Anything already on screen (the hero row) keeps the real
 * number it rendered with, which also avoids a value flash during hydration.
 */
export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [animated, setAnimated] = React.useState(false);

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1800, bounce: 0 });
  const display = useTransform(spring, (latest) =>
    format(latest, prefix, suffix, decimals)
  );

  // Runs after hydration, so the first client render still matches the server.
  React.useEffect(() => {
    const el = ref.current;
    if (el && el.getBoundingClientRect().top > window.innerHeight) {
      setAnimated(true);
    }
  }, []);

  React.useEffect(() => {
    if (animated && inView) motionValue.set(value);
  }, [animated, inView, value, motionValue]);

  return (
    <span ref={ref} className={className}>
      {animated ? (
        <motion.span>{display}</motion.span>
      ) : (
        format(value, prefix, suffix, decimals)
      )}
    </span>
  );
}

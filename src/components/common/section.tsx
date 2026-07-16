import * as React from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}
      {...props}
    />
  );
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  containerClassName?: string;
  bleak?: boolean; // when true, children manage their own container
}

export function Section({
  className,
  containerClassName,
  bleak,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("py-20 sm:py-28", className)} {...props}>
      {bleak ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest",
            light ? "text-accent" : "text-primary"
          )}
        >
          <span className="h-px w-6 bg-current opacity-60" />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.6rem] md:leading-[1.1]",
          light ? "text-white" : "text-foreground"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-base leading-relaxed sm:text-lg",
            light ? "text-white/70" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}

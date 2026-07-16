import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="H-SETS home"
    >
      <span className="relative grid size-9 place-items-center rounded-xl bg-brand-gradient text-white shadow-soft transition-transform duration-300 group-hover:scale-105">
        <span className="font-display text-lg font-bold">H</span>
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-accent ring-2 ring-white/80" />
      </span>
      <span
        className={cn(
          "font-display text-xl font-bold tracking-tight",
          light ? "text-white" : "text-foreground"
        )}
      >
        H-SETS
      </span>
    </Link>
  );
}

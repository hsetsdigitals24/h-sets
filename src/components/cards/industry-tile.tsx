import Link from "next/link";
import type { Industry } from "@/data/industries";

export function IndustryTile({ industry }: { industry: Industry }) {
  const Icon = industry.icon;
  return (
    <Link
      href={`/industries/${industry.slug}`}
      className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
    >
      <div className="pointer-events-none absolute inset-0 bg-brand-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative grid size-14 place-items-center rounded-2xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-white/20 group-hover:text-white">
        <Icon className="size-7" />
      </div>
      <span className="relative text-sm font-semibold transition-colors duration-300 group-hover:text-white">
        {industry.name}
      </span>
    </Link>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { Industry } from "@/data/industries";

export function IndustryTile({ industry }: { industry: Industry }) {
  const Icon = industry.icon;
  return (
    <Link
      href={`/industries/${industry.slug}`}
      className="group relative flex aspect-[4/5] flex-col items-center justify-end gap-3 overflow-hidden rounded-2xl border border-border p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
    >
      {/* Background image (placeholder — swap the file in /public/industries) */}
      <Image
        src={industry.image}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Legibility scrim, darker on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10 transition-opacity duration-300 group-hover:from-black/85" />
      <div className="relative grid size-14 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur-sm transition-colors duration-300 group-hover:bg-white/25">
        <Icon className="size-7" />
      </div>
      <span className="relative text-sm font-semibold text-white drop-shadow">
        {industry.name}
      </span>
    </Link>
  );
}

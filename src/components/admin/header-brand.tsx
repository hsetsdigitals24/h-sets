"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { groupForPath } from "./nav";

/**
 * Logo shown on the left of the desktop Topbar only when the sidebar is absent
 * (the dashboard landing page and other non-section pages) — mirroring the
 * Sidebar's own hide logic so branding never appears twice on a screen.
 */
export function HeaderBrand() {
  const pathname = usePathname();
  if (groupForPath(pathname)) return null;

  return (
    <Link
      href="/admin"
      aria-label="H-SETS admin home"
      className="hidden shrink-0 items-center md:inline-flex"
    >
      <Image
        src="/logo-b.png"
        width={500}
        height={200}
        alt="H-SETS logo"
        className="h-8 w-auto"
        priority
      />
    </Link>
  );
}

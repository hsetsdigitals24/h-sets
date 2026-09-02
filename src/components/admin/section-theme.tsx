"use client";

import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { NAV_GROUP_META, groupForPath } from "./nav";

/**
 * Rebinds the design-system colour tokens (`--primary`, `--accent`, `--ring`)
 * to the current section's theme, so every page and the contextual sidebar
 * inside a section inherit that section's vibrant colour as their primary and
 * accent. On the landing page and unknown paths it falls back to the global
 * brand theme (renders a plain wrapper with no overrides).
 */
export function SectionTheme({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const group = groupForPath(pathname);
  const theme = group ? NAV_GROUP_META[group].theme : null;

  const style = theme
    ? ({
        "--primary": theme.primary,
        "--primary-foreground": theme.primaryForeground,
        "--accent": theme.accent,
        "--accent-foreground": theme.accentForeground,
        "--ring": theme.primary,
      } as CSSProperties)
    : undefined;

  return (
    <div style={style} className="contents">
      {children}
    </div>
  );
}

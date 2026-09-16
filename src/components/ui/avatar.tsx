import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Up to two initials for a person's name, used as the avatar fallback when a
 * staff member hasn't uploaded a profile picture yet. Falls back to "?" for an
 * empty/unknown name so the circle is never blank.
 */
export function initialsOf(name?: string | null): string {
  const parts = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * A circular profile picture with an initials fallback.
 *
 * `size` is the rendered diameter in pixels — it drives both the box and the
 * image request, so callers get a correctly-sized asset rather than a
 * downscaled full-resolution upload.
 */
export function Avatar({
  src,
  name,
  size = 36,
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const base = cn(
    "relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground",
    className
  );

  if (src) {
    return (
      <span className={base} style={{ width: size, height: size }}>
        <Image
          src={src}
          alt={name ? `${name}'s profile picture` : "Profile picture"}
          width={size}
          height={size}
          className="size-full object-cover"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(base, "font-semibold")}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.4)) }}
      aria-hidden
    >
      {initialsOf(name)}
    </span>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Logo({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {

  if (light) {
    return (
      <Link
      href="/"
      className={cn("group inline-flex shrink-0 items-center gap-2.5", className)}
      aria-label="H-SETS home"
    >

    <Image src="/logo-w.png" width="500" height="200" alt="H-SETS logo" className="h-10 w-auto shrink-0 lg:h-8" priority />
    </Link> )
  } else {
    return (
    <Link
      href="/"
      className={cn("group inline-flex shrink-0 items-center gap-2.5", className)}
      aria-label="H-SETS home"
    >

    <Image src="/logo-b.png" width="500" height="200" alt="H-SETS logo" className="h-10 w-auto shrink-0 lg:h-8" priority />
    </Link>
    )
}
}

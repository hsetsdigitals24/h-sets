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
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="H-SETS home"
    >
      
    <Image src="/logo.png" width="100" height="100" alt="H-SETS logo" />
    </Link>
  );
}

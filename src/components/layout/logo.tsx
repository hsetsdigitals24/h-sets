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
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="H-SETS home"
    >
      
    <Image src="/logo.png" width="200" height="200" alt="H-SETS logo" className="h-11 w-auto brightness-0 invert" />
    </Link> )
  } else {
    return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="H-SETS home"
    >
      
    <Image src="/logo.png" width="200" height="200" alt="H-SETS logo" className="h-11 w-auto" />
    </Link> 
    )
}
}

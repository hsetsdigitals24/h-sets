import Link from "next/link";
import { site } from "@/lib/site";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/40 p-4">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
        poster="/hero/slide-1.png"
      >
        {/* Placeholder source — drop the real asset at public/videos/auth-bg.mp4 */}
        <source src="/videos/auth-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" aria-hidden />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-bold tracking-tight">
            {site.name} <span className="text-primary">Academy</span>
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">{children}</div>
      </div>
    </div>
  );
}

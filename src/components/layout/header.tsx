"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { mainNav, type NavItem } from "@/lib/site";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close any open menus when the route changes (sync UI to the router).
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled || mobileOpen
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl"
          : "border-b bg-white"
      )}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:h-[72px]">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {mainNav.map((item) => (
            <NavTrigger
              key={item.label}
              item={item}
              active={openMenu === item.label}
              pathname={pathname}
              onOpen={() => setOpenMenu(item.columns ? item.label : null)}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
            <Link href="/contact">Sign in</Link>
          </Button>
          <Button asChild variant="gradient" size="sm" className="hidden sm:inline-flex">
            <Link href="/contact#consultation">Get Free Consultation</Link>
          </Button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg text-foreground transition-colors hover:bg-secondary lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Desktop mega menu */}
      <AnimatePresence>
        {openMenu && (
          <MegaMenu
            item={mainNav.find((i) => i.label === openMenu)!}
            onClose={() => setOpenMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && <MobileMenu pathname={pathname} />}
      </AnimatePresence>
    </header>
  );
}

function NavTrigger({
  item,
  active,
  pathname,
  onOpen,
}: {
  item: NavItem;
  active: boolean;
  pathname: string;
  onOpen: () => void;
}) {
  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
  return (
    <div onMouseEnter={onOpen}>
      <Link
        href={item.href}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive ? "text-primary" : "text-foreground/80 hover:text-foreground",
          active && "text-primary"
        )}
      >
        {item.label}
        {item.columns && (
          <ChevronDown
            className={cn("size-3.5 transition-transform duration-200", active && "rotate-180")}
          />
        )}
      </Link>
    </div>
  );
}

function MegaMenu({ item, onClose }: { item: NavItem; onClose: () => void }) {
  if (!item.columns) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute inset-x-0 top-full hidden border-b border-border bg-background/95 shadow-soft backdrop-blur-xl lg:block"
      onMouseLeave={onClose}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-8 py-8">
        <div className="col-span-8 grid grid-cols-3 gap-x-8 gap-y-2">
          {item.columns.map((col) => (
            <div key={col.heading}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {col.heading}
              </p>
              <ul className="space-y-1">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-primary"
                    >
                      <span className="size-1.5 rounded-full bg-border transition-colors group-hover:bg-primary" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {item.featured && (
          <Link
            href={item.featured.href}
            onClick={onClose}
            className="col-span-4 group relative overflow-hidden rounded-2xl bg-ink-gradient p-6 text-white"
          >
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                Featured
              </p>
              <h4 className="mt-2 text-lg font-semibold">{item.featured.title}</h4>
              <p className="mt-1 text-sm text-white/70">{item.featured.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                Learn more
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
            <div className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/20 blur-3xl transition-transform duration-500 group-hover:scale-125" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-y-auto overscroll-contain bg-background lg:hidden"
    >
      <nav className="flex flex-col gap-1 px-5 py-6">
        {mainNav.map((item) => (
          <div key={item.label} className="border-b border-border/60 last:border-0">
            {item.columns ? (
              <>
                <button
                  type="button"
                  onClick={() => setExpanded((v) => (v === item.label ? null : item.label))}
                  className="flex w-full items-center justify-between py-3.5 text-left text-base font-medium"
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "size-5 text-muted-foreground transition-transform",
                      expanded === item.label && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {expanded === item.label && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-1 pb-3 pl-3">
                        {item.columns.flatMap((c) => c.links).map((link) => (
                          <li key={link.href + link.label}>
                            <Link
                              href={link.href}
                              className="block rounded-lg px-3 py-2 text-sm text-foreground/75 hover:bg-secondary hover:text-primary"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "block py-3.5 text-base font-medium",
                  pathname === item.href ? "text-primary" : "text-foreground"
                )}
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
        <div className="mt-6 flex flex-col gap-3">
          <Button asChild variant="gradient" size="lg">
            <Link href="/contact#consultation">Get Free Consultation</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/academy">Explore the Academy</Link>
          </Button>
        </div>
      </nav>
    </motion.div>
  );
}

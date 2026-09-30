import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

/**
 * `NextAuth(...).auth` is itself a middleware function, so it can be invoked
 * directly for the paths that need a session check. Calling it only for /admin
 * keeps the JWT decode off every marketing request.
 */
const authMiddleware = NextAuth(authConfig).auth as unknown as (
  request: NextRequest,
  event: NextFetchEvent
) => Promise<Response | undefined> | Response | undefined;

/**
 * Hosts whose traffic belongs on the main domain. The legacy WordPress Academy
 * at academy.h-sets.com is still indexed and still receiving traffic; running
 * it in parallel splits domain authority and gives Google two competing sets of
 * Academy pages. Every path is 301'd into /academy on the canonical host so the
 * accumulated link equity consolidates there.
 *
 * DNS for academy.h-sets.com must point at this deployment for these rules to
 * fire — until it does, the redirect has to be configured at the old host (or
 * as a Cloudflare page rule). See deploy/ notes.
 */
const LEGACY_ACADEMY_HOSTS = new Set(["academy.h-sets.com", "www.academy.h-sets.com"]);

/**
 * Path-level mapping from the old WordPress Academy to the new platform. A
 * blanket redirect of every path to /academy would be a soft-404 pattern in
 * Google's eyes, so known shapes keep their meaning where one exists.
 */
function academyDestination(pathname: string): string {
  // /courses/<slug> and /course/<slug> were the WordPress programme URLs.
  const course = pathname.match(/^\/courses?\/([^/]+)\/?$/);
  if (course) return `/academy/${course[1]}`;
  if (/^\/courses?\/?$/.test(pathname)) return "/academy";
  if (/^\/(blog|news)(\/|$)/.test(pathname)) return "/insights";
  if (/^\/(contact|contact-us)\/?$/.test(pathname)) return "/contact";
  if (/^\/(about|about-us)\/?$/.test(pathname)) return "/about";
  if (pathname === "/" || pathname === "") return "/academy";
  // Anything unrecognised lands on the Academy hub rather than a 404.
  return "/academy";
}

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  const host = request.headers.get("host")?.toLowerCase().split(":")[0] ?? "";

  if (LEGACY_ACADEMY_HOSTS.has(host)) {
    const url = new URL(request.nextUrl.toString());
    url.protocol = "https:";
    url.host = "h-sets.com";
    url.port = "";
    url.pathname = academyDestination(request.nextUrl.pathname);
    return NextResponse.redirect(url, 301);
  }

  // Admin routes keep the Auth.js `authorized` check; everything else passes
  // straight through (the matcher below already limits what reaches here).
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return authMiddleware(request, event);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Admin needs auth; "/" plus every non-asset path is matched so the legacy
   * host redirect can fire on any URL Google still has indexed. Static assets,
   * image optimisation and API routes are excluded to keep the hot path cheap.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\.[\\w]+$).*)"],
};

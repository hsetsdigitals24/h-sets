import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe Auth.js config shared between middleware and the full server config.
 * Contains no Node-only dependencies (no Prisma adapter, no bcrypt), so it can
 * run in the middleware runtime. The Credentials provider and Prisma adapter are
 * added on top in src/lib/auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    // Route protection. Runs in middleware for every matched request.
    authorized({ auth, request: { nextUrl } }) {
      const isAdminArea = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";
      // Public admin pages reachable without a session (sign-in + self-service
      // password recovery). Everything else under /admin requires staff.
      const isPublicAdminPath =
        isLoginPage ||
        nextUrl.pathname === "/admin/forgot-password" ||
        nextUrl.pathname === "/admin/reset-password";
      // Admin dashboard requires an admin (staff) role — a signed-in STUDENT is
      // a public/academy user and must not reach the admin area.
      const isStaff = !!auth?.user && auth.user.role !== "STUDENT";
      if (isLoginPage) {
        // Bounce already-authenticated staff away from the admin login page.
        if (isStaff) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }
      if (isPublicAdminPath) return true;
      if (isAdminArea) return isStaff;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

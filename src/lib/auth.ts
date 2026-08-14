import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { loginSchema } from "./schemas";
import {
  canAccessWith,
  effectiveSections,
  type AdminSection,
} from "./rbac";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});

/** Returns the current admin user or redirects to the login page. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session.user;
}

/**
 * Loads a user's per-section access overrides. Returns the explicit allowlist
 * of sections when the user has any override rows, or `null` when they have
 * none (meaning: fall back to their role defaults). Super admins never need
 * overrides, so we skip the query for them.
 */
export async function getSectionOverrides(
  userId: string,
  role: Role
): Promise<AdminSection[] | null> {
  if (role === "SUPER_ADMIN") return null;
  const rows = await prisma.userSectionPermission.findMany({
    where: { userId },
    select: { section: true },
  });
  return rows.length ? (rows.map((r) => r.section) as AdminSection[]) : null;
}

/** The sections a given user may access right now (role defaults + overrides). */
export async function getAllowedSections(
  userId: string,
  role: Role
): Promise<AdminSection[]> {
  const overrides = await getSectionOverrides(userId, role);
  return effectiveSections(role, overrides);
}

/**
 * Boolean, override-aware access check for use in API routes (which return JSON
 * rather than redirecting). Mirrors requireSection's logic so a section revoked
 * from a user via the per-user editor is denied here too — unlike the plain
 * role-only canAccess(), which ignores overrides.
 */
export async function userCanAccessSection(
  user: { id: string; role: Role },
  section: AdminSection
): Promise<boolean> {
  const overrides = await getSectionOverrides(user.id, user.role);
  return canAccessWith(user.role, section, overrides);
}

/**
 * Guards a section: returns the user if allowed, otherwise redirects to the
 * dashboard home. Honours per-user overrides (see getSectionOverrides).
 * SUPER_ADMIN and the always-on dashboard pass every check.
 */
export async function requireSection(section: AdminSection) {
  const user = await requireUser();
  const overrides = await getSectionOverrides(user.id, user.role);
  if (!canAccessWith(user.role, section, overrides)) redirect("/admin");
  return user;
}

/** Guards by explicit role list. SUPER_ADMIN always passes. */
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN" && !roles.includes(user.role)) {
    redirect("/admin");
  }
  return user;
}

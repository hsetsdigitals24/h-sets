import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";
import { authConfig } from "./auth.config";
import { loginSchema } from "./schemas";
import { canAccess, type AdminSection } from "./rbac";

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
 * Guards a section: returns the user if allowed, otherwise redirects to the
 * dashboard home. SUPER_ADMIN passes every check (see canAccess).
 */
export async function requireSection(section: AdminSection) {
  const user = await requireUser();
  if (!canAccess(user.role, section)) redirect("/admin");
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

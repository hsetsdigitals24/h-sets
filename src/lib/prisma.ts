import "server-only";
import { PrismaClient } from "@prisma/client";

/**
 * Single shared Prisma client.
 *
 * Cached on globalThis so Next.js hot-reload in development doesn't open a new
 * client (and connection pool) on every change. Configure the connection with
 * the DATABASE_URL env var.
 */
const globalForPrisma = globalThis as unknown as {
  _hsetsPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma._hsetsPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma._hsetsPrisma = prisma;
}

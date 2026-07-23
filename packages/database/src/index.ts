/**
 * @module @repo/db
 * @description Centralized Prisma client singleton for the BLACK AI platform.
 *
 * Exports a single PrismaClient instance that is cached on `globalThis`
 * to prevent connection exhaustion during hot-reloads in development.
 *
 * Usage:
 * ```ts
 * import { prisma } from "@repo/db";
 * const users = await prisma.user.findMany();
 * ```
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton PrismaClient instance.
 *
 * In development, the instance is cached on `globalThis` to survive
 * module hot-reloads without opening new database connections.
 *
 * In production, a fresh instance is created once per process.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Re-export all Prisma types for consumers
export * from "@prisma/client";

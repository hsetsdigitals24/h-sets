import "server-only";
import type { Prisma, Role } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Cohort-level access control for instructors.
 *
 * Instructors share the admin dashboard but may only see and manage cohorts an
 * admin has assigned them to (via `Cohort.instructors` ↔ `Instructor.userId`).
 * ACADEMY_ADMIN and SUPER_ADMIN are unrestricted.
 */

type Actor = { id: string; role: Role };

/** Prisma filter scoping cohorts to those an instructor is assigned to. Admins get {}. */
export function cohortScope(user: Actor): Prisma.CohortWhereInput {
  return user.role === "INSTRUCTOR"
    ? { instructors: { some: { userId: user.id } } }
    : {};
}

/** Prisma filter for "active" cohorts: published and not yet ended (endDate >= today). */
export function activeCohortWhere(): Prisma.CohortWhereInput {
  const today = new Date().toISOString().slice(0, 10);
  return { published: true, endDate: { gte: today } };
}

/** True if the user may manage a cohort: admins always; instructors only if assigned. */
export async function canManageCohort(user: Actor, cohortId: string): Promise<boolean> {
  if (user.role !== "INSTRUCTOR") return true;
  const n = await prisma.cohort.count({
    where: { id: cohortId, instructors: { some: { userId: user.id } } },
  });
  return n > 0;
}

import { prisma } from "./prisma";

/**
 * Ensures a User with the INSTRUCTOR role has a linked Instructor content
 * profile, so they are selectable on cohorts/programmes (which read the
 * Instructor table). Idempotent: a no-op when a profile already exists.
 *
 * Auto-created profiles carry placeholder title/bio the admin fills in at
 * /admin/instructors. They are only shown publicly once linked to a programme
 * or cohort, so the placeholders are never surfaced by accident.
 */
export async function ensureInstructorProfile(
  userId: string,
  name: string,
  opts?: { title?: string; bio?: string }
): Promise<void> {
  const existing = await prisma.instructor.findUnique({ where: { userId }, select: { id: true } });
  if (existing) return;
  const sortOrder = await prisma.instructor.count();
  const title = opts?.title?.trim() || "Instructor";
  const bio = opts?.bio?.trim() || "Profile coming soon.";
  await prisma.instructor.create({
    data: { name, title, bio, sortOrder, userId },
  });
}

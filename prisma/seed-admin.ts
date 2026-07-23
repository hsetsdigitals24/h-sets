// Admin-only seed: creates/updates a single SUPER_ADMIN from ADMIN_EMAIL /
// ADMIN_PASSWORD without touching any other content. Mirrors seedAdmin() in
// seed.ts. Run with: npm run db:seed:admin
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "[seed:admin] ADMIN_EMAIL / ADMIN_PASSWORD not set — nothing to do."
    );
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: Role.SUPER_ADMIN },
    create: {
      email,
      name: process.env.ADMIN_NAME || "Super Admin",
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`[seed:admin] Super Admin ready: ${email}`);
}

seedAdmin()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

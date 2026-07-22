-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Programme" ADD COLUMN "instructorId" TEXT;

-- Backfill: create one Instructor per distinct existing instructor JSON, then link programmes.
INSERT INTO "Instructor" ("id", "name", "title", "bio", "sortOrder", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, d."name", d."title", d."bio", 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT
        "instructor"->>'name'  AS "name",
        "instructor"->>'title' AS "title",
        "instructor"->>'bio'   AS "bio"
    FROM "Programme"
    WHERE "instructor" IS NOT NULL AND "instructor"->>'name' IS NOT NULL
) d;

UPDATE "Programme" p
SET "instructorId" = i."id"
FROM "Instructor" i
WHERE i."name" = p."instructor"->>'name'
  AND i."title" = p."instructor"->>'title'
  AND i."bio"  = p."instructor"->>'bio';

-- DropColumn (old JSON instructor, now normalized above)
ALTER TABLE "Programme" DROP COLUMN "instructor";

-- CreateIndex
CREATE INDEX "Programme_instructorId_idx" ON "Programme"("instructorId");

-- AddForeignKey
ALTER TABLE "Programme" ADD CONSTRAINT "Programme_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

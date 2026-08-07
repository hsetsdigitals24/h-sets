/*
  Warnings:

  - You are about to drop the column `epicId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_epicId_fkey";

-- DropIndex
DROP INDEX "Task_epicId_idx";

-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "epicId" TEXT;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "epicId";

-- CreateIndex
CREATE INDEX "Sprint_epicId_idx" ON "Sprint"("epicId");

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_epicId_fkey" FOREIGN KEY ("epicId") REFERENCES "Epic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

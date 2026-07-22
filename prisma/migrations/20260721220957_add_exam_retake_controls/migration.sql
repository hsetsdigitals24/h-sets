-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "cooldownMins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "retakeOnFail" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ExamRetakeGrant" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "extraAttempts" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "grantedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamRetakeGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamRetakeGrant_examId_idx" ON "ExamRetakeGrant"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamRetakeGrant_examId_studentId_key" ON "ExamRetakeGrant"("examId", "studentId");

-- AddForeignKey
ALTER TABLE "ExamRetakeGrant" ADD CONSTRAINT "ExamRetakeGrant_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamRetakeGrant" ADD CONSTRAINT "ExamRetakeGrant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

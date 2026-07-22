-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "attestationText" TEXT,
ADD COLUMN     "maxViolations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "questionsToServe" INTEGER,
ADD COLUMN     "requireAttestation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requireFullscreen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "restrictCopyPaste" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shuffleOptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trackFocus" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ExamAttempt" ADD COLUMN     "attestedAt" TIMESTAMP(3),
ADD COLUMN     "autoClosedReason" TEXT,
ADD COLUMN     "optionOrders" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "servedQuestionIds" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "violationCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ExamAttemptEvent" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamAttemptEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamAttemptEvent_attemptId_idx" ON "ExamAttemptEvent"("attemptId");

-- AddForeignKey
ALTER TABLE "ExamAttemptEvent" ADD CONSTRAINT "ExamAttemptEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

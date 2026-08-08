-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('STARTING', 'ACTIVE', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL,
    "egressId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "status" "RecordingStatus" NOT NULL DEFAULT 'STARTING',
    "classSessionId" TEXT,
    "projectId" TEXT,
    "storageKey" TEXT,
    "durationSec" INTEGER,
    "sizeBytes" BIGINT,
    "startedById" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recording_egressId_key" ON "Recording"("egressId");

-- CreateIndex
CREATE INDEX "Recording_classSessionId_startedAt_idx" ON "Recording"("classSessionId", "startedAt");

-- CreateIndex
CREATE INDEX "Recording_projectId_startedAt_idx" ON "Recording"("projectId", "startedAt");

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

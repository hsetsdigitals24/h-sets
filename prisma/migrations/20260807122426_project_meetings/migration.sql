-- CreateTable
CREATE TABLE "ProjectMeetingLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomSid" TEXT NOT NULL,
    "secondsInCall" INTEGER NOT NULL DEFAULT 0,
    "firstJoinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLeftAt" TIMESTAMP(3),
    "activeSince" TIMESTAMP(3),

    CONSTRAINT "ProjectMeetingLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectMeetingLog_projectId_firstJoinedAt_idx" ON "ProjectMeetingLog"("projectId", "firstJoinedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMeetingLog_roomSid_userId_key" ON "ProjectMeetingLog"("roomSid", "userId");

-- AddForeignKey
ALTER TABLE "ProjectMeetingLog" ADD CONSTRAINT "ProjectMeetingLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMeetingLog" ADD CONSTRAINT "ProjectMeetingLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

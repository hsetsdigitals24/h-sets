-- Personal invites keep an email; shareable "room links" have none.
ALTER TABLE "MeetingInvite" ALTER COLUMN "email" DROP NOT NULL;

-- A reusable multi-use room link vs a personal single-guest invite.
ALTER TABLE "MeetingInvite" ADD COLUMN "shareable" BOOLEAN NOT NULL DEFAULT false;

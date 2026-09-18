-- Profile pictures stored as bytes in Postgres instead of the public R2 bucket.
-- Existing User.image values (public R2 URLs) are untouched and keep working;
-- only new uploads write a row here.
CREATE TABLE "UserAvatar" (
    "userId" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAvatar_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "UserAvatar" ADD CONSTRAINT "UserAvatar_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

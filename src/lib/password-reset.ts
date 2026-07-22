import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./prisma";

/**
 * Password-reset tokens, stored in the Auth.js `VerificationToken` table
 * (identifier = user email, token = SHA-256 of the raw token we email out).
 * We never store the raw token, so a DB leak can't be used to reset passwords.
 */

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const hashToken = (raw: string) => createHash("sha256").update(raw).digest("hex");

/**
 * Issues a reset token for the given email. Clears any previous tokens for that
 * email first, then returns the raw token to embed in the reset link.
 */
export async function createResetToken(email: string): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashToken(raw),
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  return raw;
}

/**
 * Validates and consumes a reset token. Returns true only when the token
 * matches the email and hasn't expired; the token is deleted on any match
 * (single-use), and expired matches are cleaned up.
 */
export async function consumeResetToken(email: string, raw: string): Promise<boolean> {
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token: hashToken(raw) } },
  });
  if (!record) return false;

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token: record.token } },
  });

  return record.expires > new Date();
}

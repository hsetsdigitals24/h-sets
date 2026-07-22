"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { createResetToken, consumeResetToken } from "@/lib/password-reset";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/schemas";

export type AuthState = { error?: string };
export type MessageState = { error?: string; message?: string };

/** Where users land after a successful sign-in — the signed-in account page. */
const POST_AUTH_REDIRECT = "/account";

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: POST_AUTH_REDIRECT,
    });
    return {};
  } catch (error) {
    // signIn throws a redirect on success — let it propagate.
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  try {
    await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "STUDENT",
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "An account with that email already exists." };
    }
    throw e;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: POST_AUTH_REDIRECT,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      // Account was created but auto-login failed — send them to the login page.
      return { error: "Account created. Please sign in." };
    }
    throw error;
  }
}

export async function forgotPasswordAction(
  _prev: MessageState,
  formData: FormData
): Promise<MessageState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  // Same response whether or not the account exists (no enumeration).
  const genericMessage =
    "If an account exists for that email, we've sent a password reset link.";
  if (!parsed.success) {
    return { error: "Enter a valid email." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = await createResetToken(user.email);
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host") ?? "localhost:3000";
    const resetUrl = `${proto}://${host}/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;
    // console.log({"reset link": resetUrl})
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  return { message: genericMessage };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details and try again." };
  }

  const valid = await consumeResetToken(parsed.data.email, parsed.data.token);
  if (!valid) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  try {
    await prisma.user.update({
      where: { email: parsed.data.email },
      data: { passwordHash },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return { error: "This reset link is invalid or has expired. Request a new one." };
    }
    throw e;
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: POST_AUTH_REDIRECT,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Password updated. Please sign in." };
    }
    throw error;
  }
}

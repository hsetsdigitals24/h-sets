"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { createResetToken, consumeResetToken } from "@/lib/password-reset";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/schemas";

export type LoginState = { error?: string };
export type AdminMessageState = { error?: string; message?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
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
      redirectTo: "/admin",
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

export async function adminForgotPasswordAction(
  _prev: AdminMessageState,
  formData: FormData
): Promise<AdminMessageState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  // Same response whether or not a matching admin exists (no enumeration).
  const genericMessage =
    "If an admin account exists for that email, we've sent a password reset link.";
  if (!parsed.success) {
    return { error: "Enter a valid email." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // Only issue admin reset links to staff — never to student accounts.
  if (user && user.role !== "STUDENT") {
    const token = await createResetToken(user.email);
    const h = await headers();
    const proto = h.get("x-forwarded-proto") ?? "http";
    const host = h.get("host") ?? "localhost:3000";
    const resetUrl = `${proto}://${host}/admin/reset-password?token=${token}&email=${encodeURIComponent(
      user.email
    )}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  return { message: genericMessage };
}

export async function adminResetPasswordAction(
  _prev: AdminMessageState,
  formData: FormData
): Promise<AdminMessageState> {
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

  // Send them to the admin sign-in page to log in with the new password.
  redirect("/admin/login?reset=1");
}

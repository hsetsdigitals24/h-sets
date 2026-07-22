import { z } from "zod";

/** Validation schemas shared between the client forms and the API routes. */

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  company: z.string().optional(),
  topic: z.string().min(1, "Please select a topic"),
  message: z.string().min(10, "Tell us a little more (10+ characters)"),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const consultationSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  company: z.string().optional(),
  notes: z.string().optional(),
  session: z.string().min(1),
  day: z.string().min(1),
  slot: z.string().min(1, "Please pick a time slot"),
});
export type ConsultationInput = z.infer<typeof consultationSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const applicationSchema = z.object({
  cohortId: z.string().min(1, "Please choose a cohort"),
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  background: z.string().min(10, "Tell us about your background (10+ characters)"),
  motivation: z.string().min(10, "Tell us why you're applying (10+ characters)"),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;

export const jobApplicationSchema = z.object({
  jobId: z.string().min(1),
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  coverNote: z.string().min(10, "Tell the employer why you're a fit (10+ characters)"),
  cvKey: z.string().min(1, "Please attach your CV"),
  cvFileName: z.string().min(1),
});
export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Please enter your name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const resourceSchema = z.object({
  resourceId: z.string().min(1),
  resourceTitle: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  company: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
});
export type ResourceInput = z.infer<typeof resourceSchema>;

export const broadcastSchema = z.object({
  audience: z.enum([
    "all",
    "students",
    "SUPER_ADMIN",
    "ACADEMY_ADMIN",
    "MARKETING_ADMIN",
    "SALES_ADMIN",
    "FINANCE_ADMIN",
    "INSTRUCTOR",
  ]),
  title: z.string().min(2, "Title is required").max(140, "Keep the title under 140 characters"),
  body: z.string().max(1000, "Keep the message under 1000 characters").optional(),
  link: z.string().optional(),
});
export type BroadcastInput = z.infer<typeof broadcastSchema>;

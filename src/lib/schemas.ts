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

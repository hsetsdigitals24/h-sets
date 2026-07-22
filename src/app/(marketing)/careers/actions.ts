"use server";

import { buildKey, presignUpload } from "@/lib/storage";
import type { PresignResult } from "@/components/lms/file-upload";

/**
 * Presign a CV upload for a public (no-login) job application. Unlike the LMS
 * presign actions, this is intentionally unauthenticated — anyone applying to a
 * job may attach a CV. Files land in the private `job-applications/cv/` prefix.
 */
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function requestCvUpload(
  filename: string,
  contentType: string
): Promise<PresignResult> {
  if (!ALLOWED_TYPES.includes(contentType)) {
    return { error: "Please upload a PDF or Word document." };
  }
  const key = buildKey("job-applications/cv", filename);
  try {
    return { url: await presignUpload(key, contentType), key };
  } catch {
    return { error: "File uploads aren't available right now. Please try again later." };
  }
}

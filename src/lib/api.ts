/**
 * Client-side helper to submit a form to its API route.
 * Throws on non-2xx so callers can show an error toast.
 */
export type ApiEndpoint = "contact" | "consultation" | "newsletter" | "resource";

export async function submitForm<T extends Record<string, unknown>>(
  endpoint: ApiEndpoint,
  payload: T
): Promise<{ id?: number }> {
  const res = await fetch(`/api/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (json as { error?: string }).error || "Submission failed. Please try again."
    );
  }
  return (json as { data?: { id?: number } }).data ?? {};
}

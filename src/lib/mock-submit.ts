/**
 * Simulates an async form submission. In production this is where the
 * real API call (CRM lead creation, email automation, etc.) would go.
 * Logs the payload so it's visible during development.
 */
export async function mockSubmit<T extends Record<string, unknown>>(
  label: string,
  data: T
): Promise<{ ok: true }> {
  console.info(`[mock-submit] ${label}`, data);
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { ok: true };
}

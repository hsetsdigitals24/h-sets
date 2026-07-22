"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client boundary that exposes the NextAuth session to `useSession()` consumers
 * (e.g. the marketing header). Mounted at the root so it wraps the whole app.
 *
 * Children passed through it stay server-rendered — this does not force dynamic
 * rendering of otherwise-static pages. Auth state is hydrated on the client by
 * fetching /api/auth/session.
 */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

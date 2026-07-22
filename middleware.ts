import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Middleware runs the edge-safe config. The `authorized` callback in authConfig
// decides access and redirects unauthenticated users to /admin/login.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};

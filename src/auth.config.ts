import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/lib/permissions";

/**
 * Edge-safe subset of the NextAuth config — no Prisma/bcrypt imports here,
 * since this is what middleware.ts loads to decode the session JWT on the
 * Edge runtime. The Credentials provider (which needs Node APIs) lives only
 * in auth.ts, used by the route handler and server-side `auth()` calls.
 */
export const authConfig = {
  session: {
    strategy: "jwt",
    // Work-shift session: idle 8h logs the admin out; active use renews
    // the 8h window every hour so a continuous shift isn't interrupted.
    maxAge: 8 * 60 * 60,
    updateAge: 60 * 60,
  },
  pages: { signIn: "/admin/login" },
  providers: [],
  // Railway (and most PaaS reverse proxies) terminate TLS in front of the
  // app and forward the real host via X-Forwarded-Host — without this,
  // NextAuth rejects every request as an "UntrustedHost".
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = user.username as string;
        token.role = user.role as Role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;

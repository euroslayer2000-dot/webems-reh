import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { tooManyAttempts, hit, clearAttempts } from "@/lib/rate-limit";

class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials, request) => {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!username || !password) throw new InvalidCredentialsError();

        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        const throttleKey = `${username.toLowerCase()}|${ip}`;

        if (tooManyAttempts(throttleKey)) {
          throw new RateLimitedError();
        }

        const user = await prisma.user.findUnique({ where: { username } });
        const valid = user?.is_active
          ? await bcrypt.compare(password, user.password)
          : false;

        if (!user || !valid) {
          hit(throttleKey);
          throw new InvalidCredentialsError();
        }

        clearAttempts(throttleKey);
        await prisma.user.update({
          where: { id: user.id },
          data: { last_login_at: new Date() },
        });

        return {
          id: String(user.id),
          name: user.name,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
});

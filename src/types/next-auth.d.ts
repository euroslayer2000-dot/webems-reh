import type { Role } from "@/lib/permissions";

// next-auth (v5) re-exports its User/Session/JWT types from @auth/core via
// `export type {...} from "@auth/core/..."` rather than declaring them
// locally, so augmenting "next-auth"/"next-auth/jwt" does not merge onto the
// real interfaces — augment the @auth/core modules directly instead.
declare module "@auth/core/types" {
  interface User {
    username: string;
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      username: string;
      role: Role;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: Role;
  }
}

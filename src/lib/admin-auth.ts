import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { can } from "@/lib/permissions";
import type { Role } from "@/lib/permissions";

/** For Server Components (pages): redirects to login/dashboard instead of
 * rendering when the session or module permission is missing — mirrors the
 * Laravel app's `auth` + `module:{slug}` route middleware pair. */
export async function requirePageAccess(module: string): Promise<{ id: string; role: Role; name?: string | null }> {
  const session = await auth();
  if (!session) redirect("/admin/login");
  if (!can(session.user.role, module)) redirect("/admin/dashboard");
  return session.user;
}

/** For Server Actions: throws instead of redirecting, since an action is a
 * background RPC call, not a page render — the UI never exposes a way to
 * reach an action for a module the user can't see, so this is defense in
 * depth against a hand-crafted request. */
export async function requireActionAccess(module: string): Promise<{ id: string; role: Role; name?: string | null }> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (!can(session.user.role, module)) throw new Error("Forbidden");
  return session.user;
}

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Revalidates `path` (so the redirected-to page shows fresh data instead of
 * a stale Router Cache entry) then redirects to it with a ?flash= message
 * that <FlashToast/> picks up. Every mutating Server Action should redirect
 * through this rather than calling next/navigation's redirect() directly. */
export function redirectWithFlash(path: string, message: string, type: "success" | "error" = "success"): never {
  revalidatePath(path);
  const qs = new URLSearchParams({ flash: message, type });
  redirect(`${path}?${qs.toString()}`);
}

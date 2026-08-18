"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/** Reads ?flash=<message>&type=success|error set by a Server Action redirect,
 * shows it as a toast, then strips the params from the URL so a refresh
 * doesn't re-show it — a lightweight stand-in for Laravel's session flash. */
export function FlashToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const flash = searchParams.get("flash");
    if (!flash) return;

    const type = searchParams.get("type") === "error" ? "error" : "success";
    toast[type](flash);

    const next = new URLSearchParams(searchParams);
    next.delete("flash");
    next.delete("type");
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

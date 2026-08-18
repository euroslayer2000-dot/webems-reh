"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "ems-theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // The real theme is only knowable client-side (an inline script in the
    // root layout sets data-theme before hydration to avoid a flash of the
    // wrong *background/colors*, but this icon can't know which one without
    // reading the DOM) — this is React's documented exception to the
    // set-state-in-effect rule: adjusting state to a value only available
    // on the client, matching server output on first render to stay
    // hydration-safe, then correcting on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
    setIsDark(!isDark);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title="สลับโหมดสว่าง/มืด"
      aria-label="สลับโหมดสว่าง/มืด"
      className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-border bg-surface text-text transition-all hover:-rotate-[15deg] hover:text-accent-500 hover:border-accent-500"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

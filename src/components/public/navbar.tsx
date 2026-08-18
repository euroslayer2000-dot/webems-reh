"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogIn, Menu, X } from "lucide-react";
import { NAV_LINKS } from "./nav-links";
import { ThemeToggle } from "@/components/theme-toggle";

function isLinkActive(pathname: string, href: string, hasChildren: boolean) {
  if (href === "/") return pathname === "/";
  if (hasChildren) return pathname.startsWith(href.split("/")[1] ? `/${href.split("/")[1]}` : href);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close any open dropdown after navigating — adjusted during render
  // (React's documented pattern for resetting state on a prop change)
  // rather than in an effect, so it takes effect in the same render pass.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenDropdown(null);
  }

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // There's a visual gap between the nav link and its dropdown panel (the
  // panel is offset with margin-top) — without a grace period, the mouse
  // crosses empty space on the way down, mouseleave fires early, and the
  // panel closes before the pointer ever reaches it.
  function handleDropdownEnter(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  }
  function handleDropdownLeave() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 200);
  }

  return (
    <header className="sticky top-0 z-[1030] border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[14px] backdrop-saturate-150">
      <div className="relative mx-auto flex max-w-[1360px] items-center gap-4 px-4 py-2">
        <Link href="/" className="flex max-w-[62%] items-center gap-2.5 font-extrabold text-text">
          <span className="grid h-[60px] w-[60px] shrink-0 place-items-center overflow-hidden rounded-[14px] bg-white p-0.5 shadow-[var(--shadow-primary)] transition-transform hover:-rotate-6 hover:scale-105">
            <Image src="/assets/img/logoems.jpg" alt={siteName} width={60} height={60} className="h-full w-full rounded-[11px] object-contain" />
          </span>
          <span className="min-w-0">
            <span className="block [overflow-wrap:anywhere] text-[clamp(0.82rem,1.05vw,1rem)] leading-tight font-extrabold">{siteName}</span>
            <span className="mt-0.5 block text-[0.68rem] font-medium text-text-muted">ศูนย์รับแจ้งเหตุและสั่งการณ์โรงพยาบาลร้อยเอ็ด</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-0.5 xl:flex">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(pathname, link.href, !!link.children);
            return (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && handleDropdownEnter(link.label)}
                onMouseLeave={() => link.children && handleDropdownLeave()}
              >
                <Link
                  href={link.href}
                  className={`relative flex items-center gap-1 rounded-[10px] px-3.5 py-2 text-sm font-semibold whitespace-nowrap ${
                    active ? "bg-primary-50 text-primary-500 dark:bg-primary-500/16" : "text-text hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-primary-500/16"
                  }`}
                >
                  {link.label}
                  {link.children && <ChevronDown size={14} />}
                </Link>

                {link.children && openDropdown === link.label && (
                  <div className="absolute left-0 top-full mt-1.5 w-56 rounded-[var(--radius)] border border-border bg-surface p-1.5 shadow-[var(--shadow)]">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block rounded-lg px-3.5 py-2 text-sm font-semibold text-text hover:bg-primary-50 hover:text-primary-500 dark:hover:bg-primary-500/16"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-3.5">
          <Link
            href="/admin/login"
            className="hidden items-center gap-1.5 rounded-[10px] bg-[image:var(--grad-accent)] px-4.5 py-2 text-sm font-bold text-white shadow-[var(--shadow-accent)] transition-transform hover:-translate-y-0.5 xl:flex"
          >
            <LogIn size={14} /> เข้าสู่ระบบ
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-[46px] w-[46px] place-items-center rounded-xl bg-[image:var(--grad-primary)] text-white shadow-[var(--shadow-primary)] xl:hidden"
            aria-label="เปิด/ปิดเมนู"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="absolute right-4 top-full z-[1040] mt-2 w-[min(300px,calc(100vw-2rem))] max-h-[calc(100vh-100px)] overflow-y-auto rounded-[var(--radius)] border border-border bg-surface p-2.5 shadow-[var(--shadow-lg)] xl:hidden">
            <nav className="flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-[10px] px-3.5 py-3 text-[1.02rem] font-semibold text-text hover:bg-primary-50 hover:text-primary-500"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-3">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block rounded-lg px-3 py-1.5 text-sm text-text-muted hover:text-primary-500"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center justify-center gap-1.5 rounded-[10px] bg-[image:var(--grad-accent)] px-3.5 py-3 text-[1.02rem] font-bold text-white"
              >
                <LogIn size={14} /> เข้าสู่ระบบ
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

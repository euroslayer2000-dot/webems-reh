"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, ExternalLink, LogOut, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatDateTh } from "@/lib/format";

export type TopbarNotification = {
  id: number;
  title: string;
  level: string;
  is_read: boolean;
  created_at: string | Date;
};

export function Topbar({
  userName,
  userRole,
  username,
  unreadNotifications,
  recentNotifications,
  onMenuClick,
}: {
  userName: string;
  userRole: string;
  username: string;
  unreadNotifications: number;
  recentNotifications: TopbarNotification[];
  onMenuClick: () => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-[1030] flex h-[68px] items-center gap-4 border-b border-border bg-[var(--glass-bg)] px-4 backdrop-blur-[14px] sm:px-6">
      <button type="button" onClick={onMenuClick} aria-label="เมนู" className="text-text lg:hidden">
        <Menu size={24} />
      </button>

      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden items-center gap-1 text-sm text-text-muted hover:text-text sm:flex"
      >
        <ExternalLink size={14} /> ดูหน้าเว็บ
      </a>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            title="การแจ้งเตือน"
            className="relative grid h-[42px] w-[42px] place-items-center rounded-xl bg-surface-2 text-text shadow-[var(--shadow-sm)] transition-all hover:bg-[image:var(--grad-accent)] hover:text-white"
          >
            <Bell size={18} />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 max-h-[400px] w-80 overflow-y-auto rounded-[var(--radius)] border border-border bg-surface shadow-[var(--shadow-lg)]">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-sm font-semibold text-text">การแจ้งเตือน</span>
                <Link href="/admin/notification" className="text-xs text-primary-600" onClick={() => setNotifOpen(false)}>
                  ดูทั้งหมด
                </Link>
              </div>
              {recentNotifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-text-muted">ไม่มีการแจ้งเตือน</p>
              ) : (
                recentNotifications.map((n) => (
                  <Link
                    key={n.id}
                    href="/admin/equipment-borrow"
                    onClick={() => setNotifOpen(false)}
                    className={`block border-b border-border px-4 py-2.5 text-sm last:border-0 hover:bg-bg-soft ${n.is_read ? "text-text-muted" : "font-semibold text-text"}`}
                  >
                    <span className={`mr-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white ${n.level === "overdue" ? "bg-danger" : "bg-warning"}`}>
                      {n.level === "overdue" ? "เกินกำหนด" : "ใกล้ครบกำหนด"}
                    </span>
                    {n.title}
                    <div className="mt-0.5 text-xs text-text-muted">{formatDateTh(n.created_at, true)}</div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button type="button" onClick={() => setUserOpen((v) => !v)} className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--grad-accent)] font-bold text-white">
              {userName.slice(0, 1)}
            </span>
            <span className="hidden text-left md:block">
              <span className="block text-sm font-semibold leading-tight text-text">{userName}</span>
              <span className="block text-[0.72rem] text-text-muted">{userRole}</span>
            </span>
            <ChevronDown size={14} className="text-text-muted" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-52 rounded-[var(--radius)] border border-border bg-surface p-1.5 shadow-[var(--shadow-lg)]">
              <p className="px-3 py-1.5 text-xs text-text-muted">เข้าใช้: {username}</p>
              <hr className="my-1 border-border" />
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
              >
                <LogOut size={15} /> ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

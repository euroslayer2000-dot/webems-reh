"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { isLeaf, NAV_CONTENT, NAV_DASHBOARD, NAV_SYSTEM, type NavLeaf } from "./nav-items";
import { can, type Role } from "@/lib/permissions";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Leaf({
  item,
  active,
  badgeCount,
  sub,
  onNavigate,
}: {
  item: NavLeaf;
  active: boolean;
  badgeCount: number;
  sub?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`mb-0.5 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${sub ? "pl-[2.6rem] text-[0.93rem] font-normal" : ""} ${
        active ? "bg-[image:var(--grad-primary)] text-white shadow-[var(--shadow-primary)]" : "text-[#c3d1cb] hover:bg-white/6 hover:text-white"
      }`}
    >
      <item.icon size={sub ? 16 : 18} className="shrink-0" />
      <span className="flex-1">{item.label}</span>
      {badgeCount > 0 && (
        <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">{badgeCount > 9 ? "9+" : badgeCount}</span>
      )}
    </Link>
  );
}

export function Sidebar({
  role,
  unreadNotifications,
  unreadContacts,
  mobileOpen,
  onNavigate,
}: {
  role: Role;
  unreadNotifications: number;
  unreadContacts: number;
  mobileOpen: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const equipGroupActiveDefault = NAV_CONTENT.some(
    (entry) => !isLeaf(entry) && entry.items.some((item) => isActive(pathname, item.href))
  );
  const [equipOpen, setEquipOpen] = useState(equipGroupActiveDefault);

  const badgeFor = (item: NavLeaf) => (item.badge === "notification" ? unreadNotifications : item.badge === "contact" ? unreadContacts : 0);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[1040] flex w-[264px] shrink-0 flex-col bg-[#0f1b17] text-[#c3d1cb] transition-transform dark:bg-[#0a1310] lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <Link href="/admin/dashboard" className="flex items-center gap-2.5 border-b border-white/7 px-5 py-5 font-extrabold text-white">
        <span className="grid h-[52px] w-[52px] shrink-0 place-items-center overflow-hidden rounded-[14px] bg-white p-0.5">
          <Image src="/assets/img/logoems.jpg" alt="REH101 Admin" width={52} height={52} className="h-full w-full rounded-[11px] object-contain" />
        </span>
        <span>
          REH101 Admin
          <small className="block text-[0.68rem] font-medium text-[#7d9188]">ระบบจัดการเว็บไซต์</small>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto p-3.5">
        <Leaf item={NAV_DASHBOARD} active={isActive(pathname, NAV_DASHBOARD.href)} badgeCount={0} onNavigate={onNavigate} />

        {NAV_CONTENT.some((entry) => isLeaf(entry) ? can(role, entry.module) : entry.items.some((i) => can(role, i.module))) && (
          <div className="mt-2 px-3.5 py-2 text-[0.7rem] font-medium tracking-[0.12em] text-[#5f7269] uppercase">จัดการเนื้อหา</div>
        )}

        {NAV_CONTENT.map((entry) => {
          if (isLeaf(entry)) {
            if (!can(role, entry.module)) return null;
            return <Leaf key={entry.href} item={entry} active={isActive(pathname, entry.href)} badgeCount={badgeFor(entry)} onNavigate={onNavigate} />;
          }

          const visibleItems = entry.items.filter((item) => can(role, item.module));
          if (visibleItems.length === 0) return null;
          const groupActive = visibleItems.some((item) => isActive(pathname, item.href));
          const groupBadge = entry.badge === "notification" ? unreadNotifications : 0;

          return (
            <div key={entry.label}>
              <button
                type="button"
                onClick={() => setEquipOpen((v) => !v)}
                aria-expanded={equipOpen}
                className={`mb-0.5 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  groupActive ? "bg-white/6 text-white" : "text-[#c3d1cb] hover:bg-white/6 hover:text-white"
                }`}
              >
                <entry.icon size={18} className="shrink-0" />
                <span className="flex-1 text-left">{entry.label}</span>
                {groupBadge > 0 && <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">{groupBadge > 9 ? "9+" : groupBadge}</span>}
                <ChevronDown size={14} className={`transition-transform ${equipOpen ? "" : "-rotate-90"}`} />
              </button>
              {equipOpen && (
                <div className="mb-1 flex flex-col">
                  {visibleItems.map((item) => (
                    <Leaf key={item.href} item={item} active={isActive(pathname, item.href)} badgeCount={badgeFor(item)} sub onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {NAV_SYSTEM.some((item) => can(role, item.module)) && (
          <div className="mt-2 px-3.5 py-2 text-[0.7rem] font-medium tracking-[0.12em] text-[#5f7269] uppercase">ระบบ</div>
        )}
        {NAV_SYSTEM.filter((item) => can(role, item.module)).map((item) => (
          <Leaf key={item.href} item={item} active={isActive(pathname, item.href)} badgeCount={badgeFor(item)} onNavigate={onNavigate} />
        ))}
      </nav>
    </aside>
  );
}

"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar, type TopbarNotification } from "./topbar";
import type { Role } from "@/lib/permissions";

export function AdminShell({
  role,
  userName,
  userRole,
  username,
  unreadNotifications,
  unreadContacts,
  recentNotifications,
  children,
}: {
  role: Role;
  userName: string;
  userRole: string;
  username: string;
  unreadNotifications: number;
  unreadContacts: number;
  recentNotifications: TopbarNotification[];
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={role}
        unreadNotifications={unreadNotifications}
        unreadContacts={unreadContacts}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[1035] bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-[264px]">
        <Topbar
          userName={userName}
          userRole={userRole}
          username={username}
          unreadNotifications={unreadNotifications}
          recentNotifications={recentNotifications}
          onMenuClick={() => setMobileOpen((v) => !v)}
        />
        <main className="flex-1 p-4 sm:p-7">{children}</main>
      </div>
    </div>
  );
}

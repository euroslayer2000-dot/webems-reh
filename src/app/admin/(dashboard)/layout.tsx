import { Suspense } from "react";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { AdminShell } from "@/components/admin/admin-shell";
import { FlashToast } from "@/components/admin/flash-toast";

const ROLE_LABEL: Record<string, string> = { superadmin: "Super Admin", admin: "Admin", editor: "Editor" };

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware.ts already redirects unauthenticated requests before they reach here.
  const session = await auth();
  const user = session!.user;
  const role = user.role;

  const [unreadNotifications, unreadContacts, recentNotifications, unreadMedicineNotifications, recentMedicineNotifications] = await Promise.all([
    can(role, "notification") ? prisma.notification.count({ where: { is_read: false } }) : 0,
    can(role, "contact") ? prisma.contact.count({ where: { is_read: false } }) : 0,
    can(role, "notification")
      ? prisma.notification.findMany({ orderBy: [{ is_read: "asc" }, { created_at: "desc" }], take: 8 })
      : [],
    can(role, "notification") ? prisma.medicineNotification.count({ where: { is_read: false } }) : 0,
    can(role, "notification")
      ? prisma.medicineNotification.findMany({ orderBy: [{ is_read: "asc" }, { created_at: "desc" }], take: 8 })
      : [],
  ]);

  const recentCombined = [
    ...recentNotifications.map((n) => ({ id: n.id, title: n.title, level: n.level, is_read: n.is_read, created_at: n.created_at, kind: "equipment" as const })),
    ...recentMedicineNotifications.map((n) => ({ id: n.id, title: n.title, level: n.level, is_read: n.is_read, created_at: n.created_at, kind: "medicine" as const })),
  ]
    .sort((a, b) => (a.is_read === b.is_read ? +b.created_at - +a.created_at : a.is_read ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="bg-bg">
      <Toaster position="top-right" richColors />
      <Suspense fallback={null}>
        <FlashToast />
      </Suspense>
      <AdminShell
        role={role}
        userName={user.name ?? user.username}
        userRole={ROLE_LABEL[role] ?? role}
        username={user.username}
        unreadNotifications={unreadNotifications}
        unreadMedicineNotifications={unreadMedicineNotifications}
        unreadContacts={unreadContacts}
        recentNotifications={recentCombined}
      >
        {children}
      </AdminShell>
    </div>
  );
}

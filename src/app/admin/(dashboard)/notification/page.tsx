import { AlertTriangle, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { PageHead } from "@/components/admin/page-head";
import { btnGhostSm } from "@/components/admin/button-styles";
import { markAllNotificationsRead, markNotificationRead } from "./actions";

export default async function AdminNotificationPage() {
  await requirePageAccess("notification");
  const notifications = await prisma.notification.findMany({
    orderBy: [{ is_read: "asc" }, { created_at: "desc" }],
  });
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div>
      <PageHead
        title="การแจ้งเตือน"
        action={
          hasUnread && (
            <form action={markAllNotificationsRead}>
              <button type="submit" className="rounded-[10px] border border-border px-4 py-2.5 text-sm font-semibold text-text hover:bg-bg-soft">
                ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
              </button>
            </form>
          )
        }
      />

      <div className="flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 rounded-[var(--radius-lg)] border p-4 ${n.is_read ? "border-border bg-surface" : "border-warning/30 bg-warning/10"}`}
          >
            <div className={n.level === "overdue" ? "text-danger" : "text-warning"}>
              {n.level === "overdue" ? <AlertTriangle size={18} /> : <Clock size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text">{n.title}</p>
              <p className="text-sm text-text-muted">{n.message}</p>
              <p className="mt-1 text-xs text-text-muted">{formatDateTh(n.created_at, true)}</p>
            </div>
            {!n.is_read && (
              <form action={markNotificationRead}>
                <input type="hidden" name="id" value={n.id} />
                <button type="submit" className={btnGhostSm}>
                  อ่านแล้ว
                </button>
              </form>
            )}
          </div>
        ))}
        {notifications.length === 0 && <p className="py-10 text-center text-sm text-text-muted">ไม่มีการแจ้งเตือน</p>}
      </div>
    </div>
  );
}

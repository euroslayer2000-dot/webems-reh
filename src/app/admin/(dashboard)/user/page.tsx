import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deleteUser } from "./actions";

const ROLE_LABEL: Record<string, string> = { superadmin: "Super Admin", admin: "Admin", editor: "Editor" };

export default async function AdminUserPage() {
  const currentUser = await requirePageAccess("user");
  const users = await prisma.user.findMany({ orderBy: { created_at: "desc" } });

  return (
    <div>
      <PageHead
        title="ผู้ใช้งานระบบ"
        action={
          <Link href="/admin/user/create" className={btnPrimary}>
            <Plus size={16} /> เพิ่มผู้ใช้งาน
          </Link>
        }
      />

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">ชื่อ</th>
              <th className="px-5 py-3">ชื่อผู้ใช้</th>
              <th className="px-5 py-3">สิทธิ์</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => {
              const isSelf = Number(currentUser.id) === user.id;
              return (
                <tr key={user.id}>
                  <td className="px-5 py-2.5 font-medium text-text">
                    {user.name} {isSelf && <span className="text-xs text-text-muted">(คุณ)</span>}
                  </td>
                  <td className="px-5 py-2.5 text-text-muted">{user.username}</td>
                  <td className="px-5 py-2.5 text-text-muted">{ROLE_LABEL[user.role]}</td>
                  <td className="px-5 py-2.5">
                    <StatusBadge active={user.is_active} activeLabel="ใช้งานอยู่" inactiveLabel="ปิดใช้งาน" />
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/admin/user/${user.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                      {!isSelf && (
                        <form action={deleteUser}>
                          <input type="hidden" name="id" value={user.id} />
                          <ConfirmSubmitButton confirmText={`ลบผู้ใช้ "${user.name}" ?`} className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-text-muted">ยังไม่มีผู้ใช้งาน</td></tr>}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

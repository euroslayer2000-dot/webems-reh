import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deleteAed, toggleAed } from "./actions";

export default async function AdminAedPage() {
  await requirePageAccess("aed");
  const items = await prisma.aedLocation.findMany({ orderBy: { id: "desc" } });

  return (
    <div>
      <PageHead
        title="จัดการจุดติดตั้งเครื่อง AED"
        action={
          <Link href="/admin/aed/create" className={btnPrimary}>
            <Plus size={16} /> เพิ่มจุด AED
          </Link>
        }
      />

      <AdminCard className="overflow-x-auto">
        {items.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
              <tr>
                <th className="px-5 py-3">สถานที่</th>
                <th className="px-5 py-3">ตำแหน่งที่วางเครื่อง</th>
                <th className="px-5 py-3">พิกัด</th>
                <th className="px-5 py-3">สถานะ</th>
                <th className="px-5 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-2.5 font-semibold text-text">{item.name}</td>
                  <td className="px-5 py-2.5 text-text-muted">{item.detail ?? "-"}</td>
                  <td className="px-5 py-2.5 text-text-muted">{String(item.lat)}, {String(item.lng)}</td>
                  <td className="px-5 py-2.5">
                    <StatusBadge active={item.is_active} activeLabel="แสดงผล" inactiveLabel="ซ่อน" />
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <form action={toggleAed}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className={btnGhostSm}>{item.is_active ? "ซ่อน" : "แสดง"}</button>
                      </form>
                      <Link href={`/admin/aed/${item.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                      <form action={deleteAed}>
                        <input type="hidden" name="id" value={item.id} />
                        <ConfirmSubmitButton confirmText={`ลบจุด AED "${item.name}" ?`} className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="py-10 text-center text-sm text-text-muted">ยังไม่มีจุดติดตั้งเครื่อง AED</p>
        )}
      </AdminCard>
    </div>
  );
}

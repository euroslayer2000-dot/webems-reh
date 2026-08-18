import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deleteStation, toggleStation } from "./actions";

export default async function AdminStationPage() {
  await requirePageAccess("station");
  const stations = await prisma.station.findMany({ orderBy: [{ sort_order: "asc" }, { id: "asc" }] });

  return (
    <div>
      <PageHead
        title="จัดการจุดหน่วยกู้ชีพ (แผนที่)"
        action={
          <Link href="/admin/station/create" className={btnPrimary}>
            <Plus size={16} /> เพิ่มจุดหน่วย
          </Link>
        }
      />

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">ชื่อหน่วย</th>
              <th className="px-5 py-3">ประเภท</th>
              <th className="px-5 py-3">พิกัด</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stations.map((station) => (
              <tr key={station.id}>
                <td className="px-5 py-2.5 font-semibold text-text">{station.name}</td>
                <td className="px-5 py-2.5 text-text-muted">{station.type}</td>
                <td className="px-5 py-2.5 text-text-muted">{String(station.lat)}, {String(station.lng)}</td>
                <td className="px-5 py-2.5">
                  <StatusBadge active={station.is_active} activeLabel="แสดงผล" inactiveLabel="ซ่อน" />
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <form action={toggleStation}>
                      <input type="hidden" name="id" value={station.id} />
                      <button type="submit" className={btnGhostSm}>
                        {station.is_active ? "ซ่อน" : "แสดง"}
                      </button>
                    </form>
                    <Link href={`/admin/station/${station.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                    <form action={deleteStation}>
                      <input type="hidden" name="id" value={station.id} />
                      <ConfirmSubmitButton confirmText={`ลบจุดหน่วย "${station.name}" ?`} className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {stations.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-text-muted">ยังไม่มีจุดหน่วยกู้ชีพ</td></tr>}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

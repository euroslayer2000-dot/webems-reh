import Link from "next/link";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { stationTypeMeta } from "@/lib/format";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deleteStation, moveStation, toggleStation } from "./actions";

const GROUP_ORDER = ["ALS", "BLS"] as const;

export default async function AdminStationPage() {
  await requirePageAccess("station");
  const stations = await prisma.station.findMany({ orderBy: [{ sort_order: "asc" }, { id: "asc" }] });

  const groups = GROUP_ORDER.map((type) => ({
    type,
    meta: stationTypeMeta(type),
    items: stations.filter((s) => s.type === type),
  })).filter((g) => g.items.length > 0);

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

      <div className="flex flex-col gap-6">
        {groups.map((group) => (
          <AdminCard key={group.type} className="overflow-x-auto">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: group.meta.color }}
              >
                {group.type}
              </span>
              <span className="text-sm text-text-muted">{group.meta.label} ({group.items.length})</span>
            </div>

            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
                <tr>
                  <th className="px-5 py-3">ลำดับ</th>
                  <th className="px-5 py-3">ชื่อหน่วย</th>
                  <th className="px-5 py-3">พิกัด</th>
                  <th className="px-5 py-3">สถานะ</th>
                  <th className="px-5 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {group.items.map((station, i) => (
                  <tr key={station.id}>
                    <td className="px-5 py-2.5 text-text-muted">{i + 1}</td>
                    <td className="px-5 py-2.5 font-semibold text-text">{station.name}</td>
                    <td className="px-5 py-2.5 text-text-muted">{String(station.lat)}, {String(station.lng)}</td>
                    <td className="px-5 py-2.5">
                      <StatusBadge active={station.is_active} activeLabel="แสดงผล" inactiveLabel="ซ่อน" />
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <form action={moveStation}>
                          <input type="hidden" name="id" value={station.id} />
                          <input type="hidden" name="direction" value="up" />
                          <button type="submit" disabled={i === 0} aria-label="เลื่อนขึ้น" className={`${btnGhostSm} disabled:opacity-30`}>
                            <ChevronUp size={15} />
                          </button>
                        </form>
                        <form action={moveStation}>
                          <input type="hidden" name="id" value={station.id} />
                          <input type="hidden" name="direction" value="down" />
                          <button type="submit" disabled={i === group.items.length - 1} aria-label="เลื่อนลง" className={`${btnGhostSm} disabled:opacity-30`}>
                            <ChevronDown size={15} />
                          </button>
                        </form>
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
              </tbody>
            </table>
          </AdminCard>
        ))}
        {groups.length === 0 && (
          <AdminCard>
            <p className="py-10 text-center text-sm text-text-muted">ยังไม่มีจุดหน่วยกู้ชีพ</p>
          </AdminCard>
        )}
      </div>
    </div>
  );
}

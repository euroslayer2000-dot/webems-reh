import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { btnGhostSm } from "@/components/admin/button-styles";
import { StockTakeCreateForm } from "./stock-take-create-form";

export default async function StockTakePage() {
  await requirePageAccess("equipment");
  const sessions = await prisma.equipmentStockTake.findMany({
    include: { _count: { select: { items: true } }, items: { where: { checked: true }, select: { id: true } } },
    orderBy: { started_at: "desc" },
  });

  return (
    <div>
      <PageHead title="ตรวจนับครุภัณฑ์" subtitle="ตรวจนับครุภัณฑ์จริงเทียบกับข้อมูลในระบบ" />

      <AdminCard className="mb-6">
        <AdminCardBody>
          <StockTakeCreateForm />
        </AdminCardBody>
      </AdminCard>

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">รอบตรวจนับ</th>
              <th className="px-5 py-3">เริ่มเมื่อ</th>
              <th className="px-5 py-3">ความคืบหน้า</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sessions.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-2.5 font-semibold text-text">{s.title}</td>
                <td className="px-5 py-2.5 text-text-muted">{formatDateTh(s.started_at, true)}</td>
                <td className="px-5 py-2.5 text-text-muted">
                  {s.items.length} / {s._count.items} รายการ
                </td>
                <td className="px-5 py-2.5">
                  {s.completed_at ? (
                    <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">ปิดรอบแล้ว</span>
                  ) : (
                    <span className="rounded-full bg-[#fde8c8] px-2.5 py-1 text-xs font-semibold text-[#9a6a00]">กำลังตรวจนับ</span>
                  )}
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/admin/equipment-stock-take/${s.id}`} className={btnGhostSm}>เปิดรายการ</Link>
                  </div>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-text-muted">ยังไม่มีรอบตรวจนับ</td></tr>}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

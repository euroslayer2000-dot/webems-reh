import Link from "next/link";
import { AlertTriangle, CalendarClock, Layers, Pill, Plus, ShieldAlert, TrendingDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { PERIOD_LABELS, periodDateRange, type Period } from "@/lib/equipment-notifications";
import { syncMedicineAlerts } from "@/lib/medicine-notifications";
import { medicineStockState, type MedicineStockState } from "@/lib/medicine-meta";
import { MedicineCategoryBarChart, MedicineStockStateDoughnutChart } from "@/components/admin/medicine-charts";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard, AdminCardBody, AdminCardHead } from "@/components/admin/admin-card";
import { StatCard } from "@/components/admin/stat-card";
import { btnGhostSm, btnPrimary } from "@/components/admin/button-styles";

function foldCategoryBreakdown(rows: { category_name: string; c: number }[], maxSlots = 8) {
  if (rows.length <= maxSlots) return rows;
  const head = rows.slice(0, maxSlots - 1);
  const rest = rows.slice(maxSlots - 1);
  head.push({ category_name: "อื่นๆ", c: rest.reduce((sum, r) => sum + r.c, 0) });
  return head;
}

export default async function MedicineDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requirePageAccess("medicine");
  const { period: rawPeriod } = await searchParams;
  const period: Period = (["day", "week", "month", "year", "all"] as const).includes(rawPeriod as Period)
    ? (rawPeriod as Period)
    : "week";

  await syncMedicineAlerts();

  const [total, categoriesCount, medicines, recentNotifications] = await Promise.all([
    prisma.medicine.count(),
    prisma.medicineCategory.count(),
    prisma.medicine.findMany({ include: { category: true, batches: { select: { quantity_on_hand: true, expiry_date: true } } } }),
    prisma.medicineNotification.findMany({ orderBy: [{ is_read: "asc" }, { created_at: "desc" }], take: 8 }),
  ]);

  const byState: Record<MedicineStockState, number> = { normal: 0, low_stock: 0, near_expiry: 0, expired: 0 };
  const categoryCounts = new Map<string, number>();

  for (const med of medicines) {
    const totalQty = med.batches.reduce((sum, b) => sum + b.quantity_on_hand, 0);
    const nearestExpiry = med.batches
      .filter((b) => b.quantity_on_hand > 0)
      .sort((a, b) => +a.expiry_date - +b.expiry_date)[0]?.expiry_date ?? null;
    const state = medicineStockState(totalQty, med.min_stock, nearestExpiry);
    byState[state]++;

    const categoryName = med.category?.name ?? "ไม่ระบุหมวดหมู่";
    categoryCounts.set(categoryName, (categoryCounts.get(categoryName) ?? 0) + 1);
  }

  const categoryBreakdown = foldCategoryBreakdown(
    Array.from(categoryCounts.entries())
      .map(([category_name, c]) => ({ category_name, c }))
      .sort((a, b) => b.c - a.c)
  );

  const periodRange = periodDateRange(period);
  const periodWhere = periodRange ? { used_at: { gte: periodRange.gte, lte: periodRange.lte } } : {};

  const [periodDispenseCount, recentDispenses] = await Promise.all([
    prisma.medicineDispense.count({ where: periodWhere }),
    prisma.medicineDispense.findMany({
      where: periodWhere,
      include: { batch: { include: { medicine: true } } },
      orderBy: { used_at: "desc" },
      take: 10,
    }),
  ]);

  const reminders = recentNotifications.filter((n) => !n.is_read);

  return (
    <div>
      <PageHead
        title="ภาพรวมคลังยา"
        subtitle="สรุปสต๊อกยาทั้งหมด และกิจกรรมการจ่ายยา"
        action={
          <div className="flex gap-2">
            <Link href="/admin/medicine-dispense/create" className={btnGhostSm}>บันทึกการจ่ายยา</Link>
            <Link href="/admin/medicine/create" className={btnPrimary}>
              <Plus size={16} /> เพิ่มยา
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={Pill} value={total} label="รายการยาทั้งหมดในระบบ" color="green" href="/admin/medicine" />
        <StatCard icon={TrendingDown} value={byState.low_stock} label="สต๊อกต่ำ" color="blue" href="/admin/medicine?state=low_stock" />
        <StatCard icon={CalendarClock} value={byState.near_expiry} label="ใกล้หมดอายุ" color="orange" href="/admin/medicine?state=near_expiry" />
        <StatCard icon={ShieldAlert} value={byState.expired} label="หมดอายุแล้ว" color="red" href="/admin/medicine?state=expired" />
        <StatCard icon={AlertTriangle} value={reminders.length} label="แจ้งเตือนที่ยังไม่อ่าน" color="red" href="/admin/notification" />
        <StatCard icon={Layers} value={categoriesCount} label="หมวดหมู่ยา" color="pink" href="/admin/medicine-category" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <AdminCardHead title="สัดส่วนสถานะสต๊อกยา" />
          <AdminCardBody className="h-64"><MedicineStockStateDoughnutChart byState={byState} /></AdminCardBody>
        </AdminCard>
        <AdminCard>
          <AdminCardHead title="ยาตามหมวดหมู่" />
          <AdminCardBody className="h-64"><MedicineCategoryBarChart data={categoryBreakdown} /></AdminCardBody>
        </AdminCard>
      </div>

      <AdminCard className="mb-6">
        <AdminCardHead
          title="รายการจ่ายยาล่าสุด"
          action={
            <div className="flex gap-1">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <Link
                  key={p}
                  href={`/admin/medicine/dashboard?period=${p}`}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${p === period ? "bg-[image:var(--grad-primary)] text-white" : "border border-border text-text-muted hover:bg-bg-soft"}`}
                >
                  {PERIOD_LABELS[p]}
                </Link>
              ))}
            </div>
          }
        />
        <AdminCardBody>
          <p className="mb-3 text-xs text-text-muted">พบ {periodDispenseCount} รายการใน{PERIOD_LABELS[period]}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs font-semibold uppercase text-text-muted">
                <tr><th className="py-2">ยา</th><th className="py-2">ผู้ใช้</th><th className="py-2">วันที่</th><th className="py-2">จำนวน</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentDispenses.map((d) => (
                  <tr key={d.id}>
                    <td className="py-2 text-text">{d.batch.medicine.generic_name} (ล็อต {d.batch.lot_no})</td>
                    <td className="py-2 text-text-muted">{d.used_by}</td>
                    <td className="py-2 text-text-muted">{formatDateTh(d.used_at, true)}</td>
                    <td className="py-2 text-text-muted">{d.qty} {d.batch.medicine.unit}</td>
                  </tr>
                ))}
                {recentDispenses.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-text-muted">ไม่มีรายการ</td></tr>}
              </tbody>
            </table>
          </div>
        </AdminCardBody>
      </AdminCard>

      {reminders.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-warning/30 bg-warning/10 p-5">
          <h2 className="mb-3 text-sm font-bold text-text">แจ้งเตือนที่ยังไม่อ่าน</h2>
          <ul className="flex flex-col gap-2">
            {reminders.map((n) => (
              <li key={n.id} className="text-sm text-text">
                <span className="font-semibold">{n.title}</span> — {n.message}
              </li>
            ))}
          </ul>
          <Link href="/admin/notification" className="mt-3 inline-block text-xs font-semibold text-primary-600 hover:underline">
            ดูการแจ้งเตือนทั้งหมด →
          </Link>
        </div>
      )}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Boxes, CalendarClock, CheckCircle2, ClipboardList, Layers, Plus, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { uploadUrl } from "@/lib/upload";
import { PERIOD_LABELS, periodDateRange, syncEquipmentDueSoon, type Period } from "@/lib/equipment-notifications";
import { CategoryBarChart, StatusDoughnutChart } from "@/components/admin/equipment-charts";
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

export default async function EquipmentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requirePageAccess("equipment");
  const { period: rawPeriod } = await searchParams;
  const period: Period = (["day", "week", "month", "year", "all"] as const).includes(rawPeriod as Period)
    ? (rawPeriod as Period)
    : "week";

  await syncEquipmentDueSoon();

  const [total, byStatusRaw, categoriesCount, openLoans, overdueLoans, categoriesWithCounts, recentNotifications] =
    await Promise.all([
      prisma.equipment.count(),
      prisma.equipment.groupBy({ by: ["status"], _count: true }),
      prisma.equipmentCategory.count(),
      prisma.equipmentBorrow.count({ where: { return_date: null } }),
      prisma.equipmentBorrow.count({ where: { return_date: null, due_date: { lt: new Date() } } }),
      prisma.equipment.groupBy({ by: ["category_id"], _count: true }),
      prisma.notification.findMany({ orderBy: [{ is_read: "asc" }, { created_at: "desc" }], take: 8 }),
    ]);

  const byStatus: Record<string, number> = {};
  for (const row of byStatusRaw) byStatus[row.status] = row._count;

  const categoryIds = categoriesWithCounts.map((r) => r.category_id).filter((id): id is number => id !== null);
  const categories = await prisma.equipmentCategory.findMany({ where: { id: { in: categoryIds } } });
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  const categoryBreakdown = foldCategoryBreakdown(
    categoriesWithCounts
      .map((r) => ({
        category_name: r.category_id ? (categoryNameById.get(r.category_id) ?? "ไม่ระบุหมวดหมู่") : "ไม่ระบุหมวดหมู่",
        c: r._count,
      }))
      .sort((a, b) => b.c - a.c)
  );

  const periodRange = periodDateRange(period);
  const periodWhere = periodRange ? { borrow_date: { gte: periodRange.gte, lte: periodRange.lte } } : {};

  const [periodLoanCount, recentLoans] = await Promise.all([
    prisma.equipmentBorrow.count({ where: periodWhere }),
    prisma.equipmentBorrow.findMany({ where: periodWhere, include: { equipment: true }, orderBy: { borrow_date: "desc" }, take: 10 }),
  ]);

  const reminders = recentNotifications.filter((n) => !n.is_read);

  const maintenanceDueSoonCutoff = new Date();
  maintenanceDueSoonCutoff.setDate(maintenanceDueSoonCutoff.getDate() + 7);
  const maintenanceDueSoon = await prisma.equipmentMaintenanceSchedule.findMany({
    where: { completed_date: null, scheduled_date: { lte: maintenanceDueSoonCutoff } },
    include: { equipment: true },
    orderBy: { scheduled_date: "asc" },
    take: 10,
  });

  return (
    <div>
      <PageHead
        title="ภาพรวมครุภัณฑ์"
        subtitle="สรุปสถานะครุภัณฑ์ทั้งหมด และกิจกรรมยืม-คืน"
        action={
          <div className="flex gap-2">
            <Link href="/admin/equipment-borrow/create" className={btnGhostSm}>สร้างรายการยืม</Link>
            <Link href="/admin/equipment/create" className={btnPrimary}>
              <Plus size={16} /> เพิ่มครุภัณฑ์
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={Boxes} value={total} label="ครุภัณฑ์ทั้งหมดในระบบ" color="green" href="/admin/equipment" />
        <StatCard icon={CheckCircle2} value={byStatus.available ?? 0} label="พร้อมใช้งาน" color="blue" href="/admin/equipment?status=available" />
        <StatCard icon={ClipboardList} value={openLoans} label="กำลังถูกยืมอยู่" color="orange" href="/admin/equipment-borrow" />
        <StatCard icon={ShieldAlert} value={byStatus.damaged ?? 0} label="ชำรุด" color="red" href="/admin/equipment?status=damaged" />
        <StatCard icon={AlertTriangle} value={overdueLoans} label="เกินกำหนดคืน" color="red" href="/admin/equipment-borrow" />
        <StatCard icon={Layers} value={categoriesCount} label="หมวดหมู่ครุภัณฑ์" color="pink" href="/admin/equipment-category" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <AdminCardHead title="สัดส่วนสถานะครุภัณฑ์" />
          <AdminCardBody className="h-64"><StatusDoughnutChart byStatus={byStatus} /></AdminCardBody>
        </AdminCard>
        <AdminCard>
          <AdminCardHead title="ครุภัณฑ์ตามหมวดหมู่" />
          <AdminCardBody className="h-64"><CategoryBarChart data={categoryBreakdown} /></AdminCardBody>
        </AdminCard>
      </div>

      <AdminCard className="mb-6">
        <AdminCardHead
          title="รายการยืมล่าสุด"
          action={
            <div className="flex gap-1">
              {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
                <Link
                  key={p}
                  href={`/admin/equipment/dashboard?period=${p}`}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${p === period ? "bg-[image:var(--grad-primary)] text-white" : "border border-border text-text-muted hover:bg-bg-soft"}`}
                >
                  {PERIOD_LABELS[p]}
                </Link>
              ))}
            </div>
          }
        />
        <AdminCardBody>
          <p className="mb-3 text-xs text-text-muted">พบ {periodLoanCount} รายการใน{PERIOD_LABELS[period]}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs font-semibold uppercase text-text-muted">
                <tr><th className="py-2">ครุภัณฑ์</th><th className="py-2">ผู้ยืม</th><th className="py-2">วันที่ยืม</th><th className="py-2">สถานะ</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentLoans.map((loan) => {
                  const isOverdue = !loan.return_date && loan.due_date && new Date(loan.due_date) < new Date();
                  return (
                    <tr key={loan.id}>
                      <td className="py-2">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                            <Image src={uploadUrl(loan.equipment.photo)} alt="" fill sizes="36px" className="object-cover" />
                          </div>
                          <span className="text-text">{loan.equipment.code} — {loan.equipment.name}</span>
                        </div>
                      </td>
                      <td className="py-2 text-text-muted">{loan.borrower_name}</td>
                      <td className="py-2 text-text-muted">{formatDateTh(loan.borrow_date)}</td>
                      <td className="py-2">
                        {loan.return_date ? (
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">คืนแล้ว</span>
                        ) : isOverdue ? (
                          <span className="rounded-full bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">เกินกำหนดคืน</span>
                        ) : (
                          <span className="rounded-full bg-[#fde8c8] px-2 py-0.5 text-xs font-semibold text-[#9a6a00]">กำลังยืม</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {recentLoans.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-text-muted">ไม่มีรายการ</td></tr>}
              </tbody>
            </table>
          </div>
        </AdminCardBody>
      </AdminCard>

      {maintenanceDueSoon.length > 0 && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-warning/30 bg-warning/10 p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-text">
            <CalendarClock size={16} /> งานบำรุงรักษา/สอบเทียบที่ใกล้ถึงกำหนด ({maintenanceDueSoon.length} รายการ)
          </h2>
          <ul className="flex flex-col gap-1.5 text-sm text-text">
            {maintenanceDueSoon.map((s) => {
              const overdue = new Date(s.scheduled_date) < new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <li key={s.id}>
                  <Link href={`/admin/equipment/${s.equipment_id}/history`} className="font-semibold hover:underline">
                    {s.equipment.name}
                  </Link>{" "}
                  ({s.equipment.code}) — {s.title} — กำหนด {formatDateTh(s.scheduled_date)}{" "}
                  {overdue && <span className="ml-1 rounded-full bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">เกินกำหนด</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

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

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { uploadUrl } from "@/lib/upload";
import { EQUIPMENT_STATUS_META } from "@/lib/equipment-status";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard, AdminCardBody, AdminCardHead } from "@/components/admin/admin-card";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { btnDangerSm, btnGhostSm } from "@/components/admin/button-styles";
import { completeMaintenanceSchedule, createMaintenanceSchedule, deleteMaintenanceSchedule } from "./actions";
import { MaintenanceScheduleForm } from "./maintenance-schedule-form";

export default async function EquipmentHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("equipment");
  const { id } = await params;
  const equipmentId = Number(id);

  const item = await prisma.equipment.findUnique({ where: { id: equipmentId }, include: { category: true } });
  if (!item) notFound();

  const [statusLogs, borrows, schedules] = await Promise.all([
    prisma.equipmentStatusLog.findMany({ where: { equipment_id: equipmentId }, orderBy: { changed_at: "desc" } }),
    prisma.equipmentBorrow.findMany({ where: { equipment_id: equipmentId }, orderBy: { borrow_date: "desc" } }),
    prisma.equipmentMaintenanceSchedule.findMany({ where: { equipment_id: equipmentId }, orderBy: { scheduled_date: "desc" } }),
  ]);

  const status = EQUIPMENT_STATUS_META[item.status];

  return (
    <div>
      <Link href="/admin/equipment" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={15} /> กลับไปรายการครุภัณฑ์
      </Link>
      <PageHead title="ประวัติครุภัณฑ์" subtitle={`${item.code} — ${item.name}`} />

      <AdminCard className="mb-6">
        <AdminCardBody className="flex flex-wrap items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
            <Image src={uploadUrl(item.photo)} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <div>
            <div className="font-bold text-text">{item.name}</div>
            <div className="text-xs text-text-muted">
              {item.code} · {item.category?.name ?? "ไม่ระบุหมวดหมู่"} · {item.location ?? "ไม่ระบุสถานที่"}
            </div>
          </div>
          <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
        </AdminCardBody>
      </AdminCard>

      <AdminCard className="mb-6">
        <AdminCardHead title="ประวัติการเปลี่ยนสถานะ" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
              <tr>
                <th className="px-5 py-3">วันที่</th>
                <th className="px-5 py-3">เปลี่ยนจาก</th>
                <th className="px-5 py-3">เป็น</th>
                <th className="px-5 py-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {statusLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-5 py-2.5 text-text-muted">{formatDateTh(log.changed_at, true)}</td>
                  <td className="px-5 py-2.5 text-text-muted">{log.old_status ? EQUIPMENT_STATUS_META[log.old_status].label : "— (สร้างใหม่)"}</td>
                  <td className="px-5 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${EQUIPMENT_STATUS_META[log.new_status].className}`}>
                      {EQUIPMENT_STATUS_META[log.new_status].label}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-text-muted">{log.note ?? "-"}</td>
                </tr>
              ))}
              {statusLogs.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-text-muted">ยังไม่มีประวัติการเปลี่ยนสถานะ</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminCard className="mb-6">
        <AdminCardHead title="ประวัติการยืม-คืน" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
              <tr>
                <th className="px-5 py-3">ผู้ยืม</th>
                <th className="px-5 py-3">วันที่ยืม</th>
                <th className="px-5 py-3">กำหนดคืน</th>
                <th className="px-5 py-3">วันที่คืนจริง</th>
                <th className="px-5 py-3">สภาพตอนคืน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {borrows.map((loan) => (
                <tr key={loan.id}>
                  <td className="px-5 py-2.5 text-text">{loan.borrower_name}</td>
                  <td className="px-5 py-2.5 text-text-muted">{formatDateTh(loan.borrow_date, true)}</td>
                  <td className="px-5 py-2.5 text-text-muted">{loan.due_date ? formatDateTh(loan.due_date) : "-"}</td>
                  <td className="px-5 py-2.5 text-text-muted">{loan.return_date ? formatDateTh(loan.return_date, true) : "ยังไม่คืน"}</td>
                  <td className="px-5 py-2.5 text-text-muted">
                    {loan.return_condition ? (loan.return_condition === "damaged" ? "ชำรุด" : "ปกติ") : "-"}
                  </td>
                </tr>
              ))}
              {borrows.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-text-muted">ยังไม่เคยถูกยืม</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminCard>
        <AdminCardHead title="กำหนดการบำรุงรักษา/สอบเทียบ" />
        <AdminCardBody>
          <MaintenanceScheduleForm equipmentId={equipmentId} action={createMaintenanceSchedule} />

          <div className="mt-5 flex flex-col gap-2">
            {schedules.map((s) => {
              const overdue = !s.completed_date && new Date(s.scheduled_date) < new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-[10px] border border-border p-3 text-sm">
                  <CalendarClock size={16} className="shrink-0 text-primary-500" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-text">{s.title}</div>
                    <div className="text-xs text-text-muted">
                      กำหนด {formatDateTh(s.scheduled_date)}
                      {s.note ? ` · ${s.note}` : ""}
                    </div>
                  </div>
                  {s.completed_date ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">
                      <CheckCircle2 size={13} /> เสร็จแล้ว {formatDateTh(s.completed_date)}
                    </span>
                  ) : overdue ? (
                    <span className="rounded-full bg-danger/15 px-2.5 py-1 text-xs font-semibold text-danger">เกินกำหนด</span>
                  ) : (
                    <span className="rounded-full bg-[#fde8c8] px-2.5 py-1 text-xs font-semibold text-[#9a6a00]">ยังไม่ดำเนินการ</span>
                  )}
                  <div className="flex gap-1.5">
                    {!s.completed_date && (
                      <form action={completeMaintenanceSchedule}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="equipment_id" value={equipmentId} />
                        <button type="submit" className={btnGhostSm}>ทำแล้ว</button>
                      </form>
                    )}
                    <form action={deleteMaintenanceSchedule}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="equipment_id" value={equipmentId} />
                      <ConfirmSubmitButton confirmText={`ลบกำหนดการ "${s.title}" ?`} className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                    </form>
                  </div>
                </div>
              );
            })}
            {schedules.length === 0 && <p className="py-4 text-center text-sm text-text-muted">ยังไม่มีกำหนดการบำรุงรักษา</p>}
          </div>
        </AdminCardBody>
      </AdminCard>
    </div>
  );
}

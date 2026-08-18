import Image from "next/image";
import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { uploadUrl } from "@/lib/upload";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { inputClass } from "@/components/admin/form-field";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deleteBorrow, returnBorrow } from "./actions";

const DUE_SOON_DAYS = 3;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysBetween(from: Date, to: Date) {
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS);
}

export default async function AdminEquipmentBorrowPage() {
  await requirePageAccess("equipmentborrow");
  const loans = await prisma.equipmentBorrow.findMany({
    include: { equipment: true },
    orderBy: [{ return_date: "asc" }, { borrow_date: "desc" }],
  });

  const today = new Date();

  const reminders = loans
    .filter((l) => l.return_date === null && l.due_date)
    .map((l) => ({ loan: l, daysLeft: daysBetween(today, l.due_date as Date) }))
    .filter((r) => r.daysLeft <= DUE_SOON_DAYS);

  return (
    <div>
      <PageHead
        title="ยืม-คืนครุภัณฑ์"
        action={
          <Link href="/admin/equipment-borrow/create" className={btnPrimary}>
            <Plus size={16} /> สร้างรายการยืม
          </Link>
        }
      />

      {reminders.length > 0 && (
        <div className="mb-4 flex gap-2 rounded-[var(--radius-lg)] border border-warning/30 bg-warning/10 p-4">
          <Bell size={18} className="mt-0.5 shrink-0 text-warning" />
          <div>
            <div className="mb-1 text-sm font-bold text-text">แจ้งเตือนกำหนดคืนครุภัณฑ์ ({reminders.length} รายการ)</div>
            <ul className="flex flex-col gap-1 text-sm text-text">
              {reminders.map(({ loan, daysLeft }) => (
                <li key={loan.id}>
                  <strong>{loan.equipment.name}</strong> ({loan.equipment.code}) — ผู้ยืม {loan.borrower_name} — กำหนดคืน{" "}
                  {formatDateTh(loan.due_date)}{" "}
                  {daysLeft < 0 ? (
                    <span className="ml-1 rounded-full bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">
                      เกินกำหนดแล้ว {Math.abs(daysLeft)} วัน
                    </span>
                  ) : daysLeft === 0 ? (
                    <span className="ml-1 rounded-full bg-danger/15 px-2 py-0.5 text-xs font-semibold text-danger">ครบกำหนดวันนี้</span>
                  ) : (
                    <span className="ml-1 rounded-full bg-[#fde8c8] px-2 py-0.5 text-xs font-semibold text-[#9a6a00]">เหลืออีก {daysLeft} วัน</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">ครุภัณฑ์</th>
              <th className="px-5 py-3">ผู้ยืม</th>
              <th className="px-5 py-3">ติดต่อ</th>
              <th className="px-5 py-3">วันที่ยืม</th>
              <th className="px-5 py-3">กำหนดคืน</th>
              <th className="px-5 py-3">วันที่คืนจริง</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loans.map((loan) => {
              const returned = loan.return_date !== null;
              const overdue = !returned && loan.due_date !== null && startOfDay(loan.due_date) < startOfDay(today);
              const daysLeft = !returned && loan.due_date ? daysBetween(today, loan.due_date) : null;
              const dueSoon = !returned && !overdue && daysLeft !== null && daysLeft <= DUE_SOON_DAYS;

              return (
                <tr key={loan.id}>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                        <Image src={uploadUrl(loan.equipment.photo)} alt="" fill sizes="36px" className="object-cover" />
                      </div>
                      <div>
                        <div className="font-semibold text-text">{loan.equipment.name}</div>
                        <div className="text-xs text-text-muted">{loan.equipment.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-text">{loan.borrower_name}</td>
                  <td className="px-5 py-2.5 text-text-muted">{loan.borrower_contact ?? "-"}</td>
                  <td className="px-5 py-2.5 text-text-muted">{formatDateTh(loan.borrow_date, true)}</td>
                  <td className="px-5 py-2.5 text-text-muted">{loan.due_date ? formatDateTh(loan.due_date) : "-"}</td>
                  <td className="px-5 py-2.5 text-text-muted">{loan.return_date ? formatDateTh(loan.return_date, true) : "-"}</td>
                  <td className="px-5 py-2.5">
                    {returned ? (
                      loan.return_condition === "damaged" ? (
                        <span className="rounded-full bg-danger/15 px-2.5 py-1 text-xs font-semibold text-danger">คืนแล้ว (ชำรุด)</span>
                      ) : (
                        <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">คืนแล้ว (ปกติ)</span>
                      )
                    ) : overdue ? (
                      <span className="rounded-full bg-danger/15 px-2.5 py-1 text-xs font-semibold text-danger">เกินกำหนดคืน</span>
                    ) : dueSoon ? (
                      <span className="rounded-full bg-[#fde8c8] px-2.5 py-1 text-xs font-semibold text-[#9a6a00]">ใกล้ครบกำหนด ({daysLeft} วัน)</span>
                    ) : (
                      <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700">กำลังยืม</span>
                    )}
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      {!loan.return_date && (
                        <form action={returnBorrow} className="flex items-center gap-1">
                          <input type="hidden" name="id" value={loan.id} />
                          <select name="return_condition" className={`${inputClass} px-2 py-1 text-xs`}>
                            <option value="normal">ปกติ</option>
                            <option value="damaged">ชำรุด</option>
                          </select>
                          <button type="submit" className={btnGhostSm}>รับคืน</button>
                        </form>
                      )}
                      <Link href={`/admin/equipment-borrow/${loan.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                      <form action={deleteBorrow}>
                        <input type="hidden" name="id" value={loan.id} />
                        <ConfirmSubmitButton confirmText="ลบรายการยืมนี้ ?" className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {loans.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-text-muted">ยังไม่มีรายการยืม</td></tr>}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

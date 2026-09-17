import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { uploadUrl } from "@/lib/upload";
import { MEDICINE_STOCK_STATE_META } from "@/lib/medicine-meta";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard, AdminCardBody, AdminCardHead } from "@/components/admin/admin-card";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { completeChecklist, updateChecklistItem } from "../actions";

const EXPIRY_FLAG_META: Record<string, { label: string; className: string }> = {
  normal: MEDICINE_STOCK_STATE_META.normal,
  near_expiry: MEDICINE_STOCK_STATE_META.near_expiry,
  expired: MEDICINE_STOCK_STATE_META.expired,
};

export default async function ChecklistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("medicine");
  const { id } = await params;
  const checklistId = Number(id);

  const session = await prisma.medicineChecklist.findUnique({
    where: { id: checklistId },
    include: { items: { include: { medicine: { include: { category: true } } }, orderBy: [{ checked: "asc" }, { id: "asc" }] } },
  });
  if (!session) notFound();

  const checkedCount = session.items.filter((i) => i.checked).length;
  const mismatched = session.items.filter((i) => i.checked && i.actual_qty !== null && i.actual_qty !== i.expected_qty);

  return (
    <div>
      <Link href="/admin/medicine-checklist" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={15} /> กลับไปรายการรอบตรวจเช็ค
      </Link>
      <PageHead
        title={session.title}
        subtitle={`เริ่มเมื่อ ${formatDateTh(session.started_at, true)}${session.completed_at ? ` · ปิดรอบเมื่อ ${formatDateTh(session.completed_at, true)}` : ""}`}
        action={
          !session.completed_at && (
            <form action={completeChecklist}>
              <input type="hidden" name="id" value={session.id} />
              <ConfirmSubmitButton
                confirmText={`ปิดรอบตรวจเช็ค? รายการที่ยังไม่บันทึกจำนวน (${session.items.length - checkedCount} รายการ) จะถือว่ายังไม่ได้ตรวจ`}
                className={btnPrimary}
              >
                ปิดรอบตรวจเช็ค
              </ConfirmSubmitButton>
            </form>
          )
        }
      />

      <AdminCard className="mb-6">
        <AdminCardBody>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-text">ความคืบหน้า</span>
            <span className="text-text-muted">
              {checkedCount} / {session.items.length} รายการ
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-soft">
            <div
              className="h-full bg-[image:var(--grad-primary)]"
              style={{ width: `${session.items.length ? (checkedCount / session.items.length) * 100 : 0}%` }}
            />
          </div>
        </AdminCardBody>
      </AdminCard>

      {mismatched.length > 0 && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-warning/30 bg-warning/10 p-5">
          <h2 className="mb-2 text-sm font-bold text-text">รายการที่นับได้ไม่ตรงกับระบบ ({mismatched.length} รายการ)</h2>
          <p className="mb-2 text-xs text-text-muted">
            หมายเหตุ: จำนวนที่คาดไว้ถูกบันทึก ณ วันเริ่มรอบ หากมีการรับยาเข้า/จ่ายยาระหว่างรอบตรวจเช็ค ตัวเลขนี้อาจต่างจากความจริงโดยไม่ใช่ความผิดพลาดจากการนับ
          </p>
          <ul className="flex flex-col gap-1 text-sm text-text">
            {mismatched.map((i) => (
              <li key={i.id}>
                {i.medicine.generic_name} — คาดไว้ {i.expected_qty} {i.medicine.unit}, นับได้ {i.actual_qty} {i.medicine.unit}
              </li>
            ))}
          </ul>
        </div>
      )}

      <AdminCard>
        <AdminCardHead title="รายการยา" />
        <div className="divide-y divide-border">
          {session.items.map((i) => {
            const flag = i.expiry_flag ? EXPIRY_FLAG_META[i.expiry_flag] : null;
            return (
              <div key={i.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                  <Image src={uploadUrl(i.medicine.photo)} alt="" fill sizes="40px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-text">{i.medicine.generic_name}</div>
                  <div className="text-xs text-text-muted">
                    {i.medicine.code} · {i.medicine.category?.name ?? "ไม่ระบุหมวดหมู่"} · คาดไว้ {i.expected_qty} {i.medicine.unit}
                  </div>
                </div>
                {flag && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${flag.className}`}>{flag.label}</span>}
                {i.checked && i.checked_at && (
                  <span className="text-xs text-text-muted">นับเมื่อ {formatDateTh(i.checked_at, true)}</span>
                )}
                {!session.completed_at ? (
                  <form action={updateChecklistItem} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={i.id} />
                    <input type="hidden" name="checklist_id" value={session.id} />
                    <input
                      type="number"
                      name="actual_qty"
                      min="0"
                      defaultValue={i.actual_qty ?? i.expected_qty}
                      className="w-24 rounded-[10px] border border-border bg-surface px-2.5 py-1.5 text-sm text-text focus:border-primary-500 focus:outline-none"
                    />
                    <button type="submit" className={btnGhostSm}>บันทึก</button>
                  </form>
                ) : (
                  <span className="text-sm font-semibold text-text">
                    นับได้ {i.actual_qty ?? "-"} {i.medicine.unit}
                  </span>
                )}
              </div>
            );
          })}
          {session.items.length === 0 && <p className="px-5 py-10 text-center text-text-muted">ไม่มียาในระบบขณะเริ่มรอบตรวจเช็คนี้</p>}
        </div>
      </AdminCard>
    </div>
  );
}

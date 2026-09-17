import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { uploadUrl } from "@/lib/upload";
import { MEDICINE_CLASSIFICATION_META, MEDICINE_STORAGE_META } from "@/lib/medicine-meta";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard, AdminCardBody, AdminCardHead } from "@/components/admin/admin-card";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { btnDangerSm } from "@/components/admin/button-styles";
import { writeOffBatch } from "./actions";
import { BatchCreateForm } from "./batch-create-form";
import { AdjustBatchButton } from "./adjust-batch-button";

const MOVEMENT_LABELS: Record<string, string> = {
  received: "รับเข้า",
  dispensed: "จ่ายออก",
  adjusted: "ปรับยอด",
  expired_writeoff: "ตัดจำหน่าย (หมดอายุ)",
  lost: "สูญหาย",
};

export default async function MedicineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("medicine");
  const { id } = await params;
  const medicineId = Number(id);

  const item = await prisma.medicine.findUnique({ where: { id: medicineId }, include: { category: true } });
  if (!item) notFound();

  const [batches, stockLogs] = await Promise.all([
    prisma.medicineBatch.findMany({ where: { medicine_id: medicineId }, orderBy: { expiry_date: "asc" } }),
    prisma.medicineStockLog.findMany({ where: { batch: { medicine_id: medicineId } }, include: { batch: true }, orderBy: { created_at: "desc" }, take: 30 }),
  ]);

  const classification = MEDICINE_CLASSIFICATION_META[item.classification];
  const storage = MEDICINE_STORAGE_META[item.storage_condition];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <Link href="/admin/medicine" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={15} /> กลับไปรายการยา
      </Link>
      <PageHead title="จัดการล็อตยา" subtitle={`${item.code} — ${item.generic_name}`} />

      <AdminCard className="mb-6">
        <AdminCardBody className="flex flex-wrap items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
            <Image src={uploadUrl(item.photo)} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <div>
            <div className="font-bold text-text">{item.generic_name}{item.trade_name ? ` (${item.trade_name})` : ""}</div>
            <div className="text-xs text-text-muted">
              {item.code} · {item.category?.name ?? "ไม่ระบุหมวดหมู่"} · {storage.label}
            </div>
          </div>
          <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${classification.className}`}>{classification.label}</span>
        </AdminCardBody>
      </AdminCard>

      <AdminCard className="mb-6">
        <AdminCardHead title="ล็อตยาทั้งหมด" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
              <tr>
                <th className="px-5 py-3">เลขล็อต</th>
                <th className="px-5 py-3">วันหมดอายุ</th>
                <th className="px-5 py-3">คงเหลือ</th>
                <th className="px-5 py-3">สถานที่</th>
                <th className="px-5 py-3">ผู้จำหน่าย</th>
                <th className="px-5 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {batches.map((batch) => {
                const expiry = new Date(batch.expiry_date);
                expiry.setHours(0, 0, 0, 0);
                const diffDays = Math.round((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
                const expired = diffDays < 0;
                const nearExpiry = !expired && diffDays <= 90;
                return (
                  <tr key={batch.id}>
                    <td className="px-5 py-2.5 font-mono text-text-muted">{batch.lot_no}</td>
                    <td className="px-5 py-2.5">
                      <span className={expired ? "font-semibold text-danger" : nearExpiry ? "font-semibold text-warning" : "text-text-muted"}>
                        {formatDateTh(batch.expiry_date)}
                      </span>
                      {expired && <span className="ml-2 rounded-full bg-danger/15 px-2 py-0.5 text-[11px] font-semibold text-danger">หมดอายุแล้ว</span>}
                      {nearExpiry && <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">ใกล้หมดอายุ</span>}
                    </td>
                    <td className="px-5 py-2.5 text-text-muted">{batch.quantity_on_hand.toLocaleString("th-TH")} {item.unit}</td>
                    <td className="px-5 py-2.5 text-text-muted">{batch.location ?? "-"}</td>
                    <td className="px-5 py-2.5 text-text-muted">{batch.supplier ?? "-"}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <AdjustBatchButton batchId={batch.id} medicineId={medicineId} lotNo={batch.lot_no} currentQty={batch.quantity_on_hand} />
                        {batch.quantity_on_hand > 0 && (
                          <form action={writeOffBatch}>
                            <input type="hidden" name="id" value={batch.id} />
                            <input type="hidden" name="medicine_id" value={medicineId} />
                            <input type="hidden" name="note" value="ตัดจำหน่ายยาหมดอายุ" />
                            <ConfirmSubmitButton confirmText={`ตัดจำหน่ายล็อต "${batch.lot_no}" ทั้งหมด ?`} className={btnDangerSm}>ตัดจำหน่าย</ConfirmSubmitButton>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {batches.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-text-muted">ยังไม่มีล็อตยา</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminCard className="mb-6">
        <AdminCardHead title="รับยาเข้าล็อตใหม่" />
        <AdminCardBody>
          <BatchCreateForm medicineId={medicineId} />
        </AdminCardBody>
      </AdminCard>

      <AdminCard>
        <AdminCardHead title="ประวัติการเคลื่อนไหวสต๊อก" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
              <tr>
                <th className="px-5 py-3">วันที่</th>
                <th className="px-5 py-3">เลขล็อต</th>
                <th className="px-5 py-3">รายการ</th>
                <th className="px-5 py-3">จำนวนที่เปลี่ยน</th>
                <th className="px-5 py-3">โดย</th>
                <th className="px-5 py-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stockLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-5 py-2.5 text-text-muted">{formatDateTh(log.created_at, true)}</td>
                  <td className="px-5 py-2.5 font-mono text-text-muted">{log.batch.lot_no}</td>
                  <td className="px-5 py-2.5 text-text">{MOVEMENT_LABELS[log.movement_type] ?? log.movement_type}</td>
                  <td className={`px-5 py-2.5 font-semibold ${log.qty_change < 0 ? "text-danger" : "text-primary-700"}`}>
                    {log.qty_change > 0 ? `+${log.qty_change}` : log.qty_change}
                  </td>
                  <td className="px-5 py-2.5 text-text-muted">{log.performed_by}</td>
                  <td className="px-5 py-2.5 text-text-muted">{log.note ?? "-"}</td>
                </tr>
              ))}
              {stockLogs.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-text-muted">ยังไม่มีประวัติการเคลื่อนไหว</td></tr>}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}

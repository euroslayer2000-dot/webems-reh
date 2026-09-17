"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";

const batchSchema = z.object({
  medicine_id: z.coerce.number().int(),
  lot_no: z.string().min(1, "กรุณากรอกเลขล็อต").max(80),
  expiry_date: z.string().min(1, "กรุณาระบุวันหมดอายุ"),
  quantity: z.coerce.number().int().min(1, "จำนวนต้องมากกว่า 0"),
  location: z.string().optional(),
  supplier: z.string().optional(),
  purchase_price: z.string().optional(),
  received_date: z.string().optional(),
});

export type BatchFormState = { ok: boolean; errors?: Record<string, string> };

export async function createBatch(_prev: BatchFormState, formData: FormData): Promise<BatchFormState> {
  const performedBy = await requireActionAccess("medicine");
  const parsed = batchSchema.safeParse({
    medicine_id: formData.get("medicine_id"),
    lot_no: formData.get("lot_no"),
    expiry_date: formData.get("expiry_date"),
    quantity: formData.get("quantity"),
    location: formData.get("location") || undefined,
    supplier: formData.get("supplier") || undefined,
    purchase_price: formData.get("purchase_price") || undefined,
    received_date: formData.get("received_date") || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, errors };
  }

  const batch = await prisma.medicineBatch.create({
    data: {
      medicine_id: parsed.data.medicine_id,
      lot_no: parsed.data.lot_no,
      expiry_date: new Date(parsed.data.expiry_date),
      quantity_on_hand: parsed.data.quantity,
      location: parsed.data.location || null,
      supplier: parsed.data.supplier || null,
      purchase_price: parsed.data.purchase_price || null,
      received_date: parsed.data.received_date ? new Date(parsed.data.received_date) : null,
    },
  });
  await prisma.medicineStockLog.create({
    data: { batch_id: batch.id, movement_type: "received", qty_change: parsed.data.quantity, performed_by: performedBy.name ?? "ระบบ" },
  });

  redirectWithFlash(`/admin/medicine/${parsed.data.medicine_id}`, "รับยาเข้าล็อตใหม่เรียบร้อยแล้ว");
}

export async function adjustBatch(formData: FormData): Promise<void> {
  const performedBy = await requireActionAccess("medicine");
  const id = Number(formData.get("id"));
  const medicineId = Number(formData.get("medicine_id"));
  const newQuantity = Number(formData.get("new_quantity"));
  const note = String(formData.get("note") ?? "").trim();

  if (!Number.isInteger(newQuantity) || newQuantity < 0) {
    redirectWithFlash(`/admin/medicine/${medicineId}`, "จำนวนที่ปรับต้องเป็นเลขจำนวนเต็มไม่ติดลบ", "error");
  }
  if (!note) {
    redirectWithFlash(`/admin/medicine/${medicineId}`, "กรุณาระบุเหตุผลในการปรับยอด", "error");
  }

  const batch = await prisma.medicineBatch.findUniqueOrThrow({ where: { id } });
  const diff = newQuantity - batch.quantity_on_hand;

  if (diff !== 0) {
    await prisma.medicineBatch.update({ where: { id }, data: { quantity_on_hand: newQuantity } });
    await prisma.medicineStockLog.create({
      data: { batch_id: id, movement_type: "adjusted", qty_change: diff, note, performed_by: performedBy.name ?? "ระบบ" },
    });
  }

  redirectWithFlash(`/admin/medicine/${medicineId}`, "ปรับยอดล็อตเรียบร้อยแล้ว");
}

export async function writeOffBatch(formData: FormData): Promise<void> {
  const performedBy = await requireActionAccess("medicine");
  const id = Number(formData.get("id"));
  const medicineId = Number(formData.get("medicine_id"));
  const note = String(formData.get("note") ?? "").trim() || "ตัดจำหน่ายยาหมดอายุ";

  const batch = await prisma.medicineBatch.findUniqueOrThrow({ where: { id } });
  if (batch.quantity_on_hand > 0) {
    await prisma.medicineBatch.update({ where: { id }, data: { quantity_on_hand: 0 } });
    await prisma.medicineStockLog.create({
      data: { batch_id: id, movement_type: "expired_writeoff", qty_change: -batch.quantity_on_hand, note, performed_by: performedBy.name ?? "ระบบ" },
    });
  }

  redirectWithFlash(`/admin/medicine/${medicineId}`, "ตัดจำหน่ายล็อตเรียบร้อยแล้ว");
}

"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";

const createSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อรอบตรวจเช็ค").max(200),
});

export type ChecklistFormState = { ok: boolean; errors?: Record<string, string> };

export async function createChecklist(_prev: ChecklistFormState, formData: FormData): Promise<ChecklistFormState> {
  await requireActionAccess("medicine");
  const parsed = createSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, errors };
  }

  const medicines = await prisma.medicine.findMany({
    where: { is_active: true },
    include: { batches: { select: { quantity_on_hand: true, expiry_date: true } } },
  });

  const checklist = await prisma.medicineChecklist.create({ data: { title: parsed.data.title } });
  if (medicines.length > 0) {
    await prisma.medicineChecklistItem.createMany({
      data: medicines.map((m) => {
        const expected_qty = m.batches.reduce((sum, b) => sum + b.quantity_on_hand, 0);
        const nearestExpiry = m.batches
          .filter((b) => b.quantity_on_hand > 0)
          .sort((a, b) => +a.expiry_date - +b.expiry_date)[0]?.expiry_date ?? null;
        return { checklist_id: checklist.id, medicine_id: m.id, expected_qty, snapshot_nearest_expiry: nearestExpiry };
      }),
    });
  }

  redirectWithFlash(`/admin/medicine-checklist/${checklist.id}`, "เริ่มรอบตรวจเช็คเรียบร้อยแล้ว");
}

export async function updateChecklistItem(formData: FormData): Promise<void> {
  await requireActionAccess("medicine");
  const id = Number(formData.get("id"));
  const checklistId = Number(formData.get("checklist_id"));
  const actualQty = Number(formData.get("actual_qty"));
  const note = String(formData.get("note") ?? "").trim();

  if (!Number.isInteger(actualQty) || actualQty < 0) {
    redirectWithFlash(`/admin/medicine-checklist/${checklistId}`, "จำนวนที่นับได้ต้องเป็นเลขจำนวนเต็มไม่ติดลบ", "error");
  }

  const item = await prisma.medicineChecklistItem.findUniqueOrThrow({
    where: { id },
    include: { medicine: { include: { batches: { select: { quantity_on_hand: true, expiry_date: true } } } } },
  });

  const nearestExpiry = item.medicine.batches
    .filter((b) => b.quantity_on_hand > 0)
    .sort((a, b) => +a.expiry_date - +b.expiry_date)[0]?.expiry_date ?? null;

  let expiry_flag: "normal" | "near_expiry" | "expired" | null = null;
  if (nearestExpiry) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(nearestExpiry);
    expiry.setHours(0, 0, 0, 0);
    const diffDays = Math.round((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    expiry_flag = diffDays < 0 ? "expired" : diffDays <= 90 ? "near_expiry" : "normal";
  }

  await prisma.medicineChecklistItem.update({
    where: { id },
    data: { actual_qty: actualQty, checked: true, checked_at: new Date(), expiry_flag, note: note || null },
  });

  redirectWithFlash(`/admin/medicine-checklist/${checklistId}`, "บันทึกจำนวนที่นับได้แล้ว");
}

export async function completeChecklist(formData: FormData): Promise<void> {
  await requireActionAccess("medicine");
  const id = Number(formData.get("id"));

  await prisma.medicineChecklist.update({ where: { id }, data: { completed_at: new Date() } });

  redirectWithFlash(`/admin/medicine-checklist/${id}`, "ปิดรอบตรวจเช็คเรียบร้อยแล้ว");
}

export async function deleteChecklist(formData: FormData): Promise<void> {
  await requireActionAccess("medicine");
  const id = Number(formData.get("id"));

  await prisma.medicineChecklist.delete({ where: { id } });

  redirectWithFlash("/admin/medicine-checklist", "ลบรอบตรวจเช็คเรียบร้อยแล้ว");
}

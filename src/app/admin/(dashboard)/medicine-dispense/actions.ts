"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";
import { medicineNeedsWitness } from "@/lib/medicine-meta";

const createSchema = z.object({
  batch_id: z.coerce.number().int(),
  qty: z.coerce.number().int().min(1, "จำนวนต้องมากกว่า 0"),
  used_by: z.string().min(1, "กรุณากรอกชื่อผู้ใช้ยา").max(150),
  used_at: z.string().min(1, "กรุณาระบุวันเวลาที่ใช้ยา"),
  station: z.string().optional(),
  patient_report_id: z.string().optional(),
  witness_name: z.string().optional(),
  note: z.string().optional(),
});

export type DispenseFormState = { ok: boolean; errors?: Record<string, string> };

export async function createDispense(_prev: DispenseFormState, formData: FormData): Promise<DispenseFormState> {
  await requireActionAccess("medicinedispense");
  const parsed = createSchema.safeParse({
    batch_id: formData.get("batch_id"),
    qty: formData.get("qty"),
    used_by: formData.get("used_by"),
    used_at: formData.get("used_at"),
    station: formData.get("station") || undefined,
    patient_report_id: formData.get("patient_report_id") || undefined,
    witness_name: formData.get("witness_name") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, errors };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const batch = await tx.medicineBatch.findUniqueOrThrow({
        where: { id: parsed.data.batch_id },
        include: { medicine: true },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (batch.expiry_date < today) throw new Error("ล็อตนี้หมดอายุแล้ว ไม่สามารถจ่ายยาได้");

      if (medicineNeedsWitness(batch.medicine.classification) && !parsed.data.witness_name) {
        throw new Error("ยานี้ต้องมีพยานยืนยันการจ่ายยา (ยาควบคุมพิเศษ/วัตถุออกฤทธิ์ต่อจิตประสาท/ยาเสพติด)");
      }

      // Atomic guard: the WHERE re-checks quantity_on_hand at UPDATE time so a
      // concurrent dispense against the same batch can't race past a stale
      // read — if someone else already took the stock, this affects 0 rows.
      const result = await tx.medicineBatch.updateMany({
        where: { id: batch.id, quantity_on_hand: { gte: parsed.data.qty } },
        data: { quantity_on_hand: { decrement: parsed.data.qty } },
      });
      if (result.count === 0) throw new Error("จำนวนคงเหลือในล็อตนี้ไม่พอสำหรับการจ่ายครั้งนี้");

      await tx.medicineDispense.create({
        data: {
          batch_id: batch.id,
          qty: parsed.data.qty,
          used_by: parsed.data.used_by,
          used_at: new Date(parsed.data.used_at),
          station: parsed.data.station || null,
          patient_report_id: parsed.data.patient_report_id ? Number(parsed.data.patient_report_id) : null,
          witness_name: parsed.data.witness_name || null,
          note: parsed.data.note || null,
        },
      });
      await tx.medicineStockLog.create({
        data: { batch_id: batch.id, movement_type: "dispensed", qty_change: -parsed.data.qty, performed_by: parsed.data.used_by },
      });
    });
  } catch (e) {
    return { ok: false, errors: { qty: e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่" } };
  }

  redirectWithFlash("/admin/medicine-dispense", "บันทึกการจ่ายยาเรียบร้อยแล้ว");
}

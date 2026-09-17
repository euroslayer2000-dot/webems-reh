import { prisma } from "@/lib/prisma";

const TYPE_EXPIRING = "medicine_expiring";
const TYPE_EXPIRED = "medicine_expired";
const TYPE_LOW_STOCK = "medicine_low_stock";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysBetween(from: Date, to: Date): number {
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS);
}

function formatThaiDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/**
 * Upserts medicine alert notifications, matching syncEquipmentDueSoon()'s
 * semantics (new rows start unread, an escalation re-flags unread, an
 * unchanged level leaves the row untouched) across two independent sweeps:
 * batch-scoped expiry (medicine_expiring/medicine_expired) and
 * medicine-scoped low stock (medicine_low_stock). Runs on the shared
 * sync-notifications cron and inline on the medicine dashboard's page load.
 */
export async function syncMedicineAlerts(expiryWindowDays = 90): Promise<void> {
  const today = startOfDay(new Date());
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + expiryWindowDays);

  // Sweep 1: batch-scoped expiring/expired.
  const batches = await prisma.medicineBatch.findMany({
    where: { quantity_on_hand: { gt: 0 }, expiry_date: { lte: cutoff } },
    include: { medicine: true },
  });

  for (const batch of batches) {
    const expiry = startOfDay(batch.expiry_date);
    const diff = daysBetween(today, expiry);
    const type = diff < 0 ? TYPE_EXPIRED : TYPE_EXPIRING;
    const level = diff < 0 ? "overdue" : "due_soon";
    const title = `${diff < 0 ? "ยาหมดอายุ" : "ยาใกล้หมดอายุ"}: ${batch.medicine.generic_name} (ล็อต ${batch.lot_no})`;
    const message =
      `คงเหลือ ${batch.quantity_on_hand} ${batch.medicine.unit} — วันหมดอายุ ${formatThaiDate(expiry)}` +
      (diff < 0 ? ` (หมดอายุแล้ว ${-diff} วัน)` : diff === 0 ? " (หมดอายุวันนี้)" : ` (เหลืออีก ${diff} วัน)`);

    // A batch can flip from "expiring" to "expired" as time passes — since
    // that's a different `type` value (not just a level change), clear any
    // stale row under the other expiry type before upserting the current one.
    await prisma.medicineNotification.deleteMany({
      where: {
        medicine_batch_id: batch.id,
        type: { in: [TYPE_EXPIRING, TYPE_EXPIRED] },
        NOT: { type },
      },
    });

    const existing = await prisma.medicineNotification.findUnique({
      where: { type_medicine_batch_id: { type, medicine_batch_id: batch.id } },
    });

    if (!existing) {
      await prisma.medicineNotification.create({
        data: { type, level, medicine_id: batch.medicine_id, medicine_batch_id: batch.id, title, message, is_read: false },
      });
    } else if (existing.level !== level) {
      await prisma.medicineNotification.update({ where: { id: existing.id }, data: { level, message, is_read: false } });
    }
  }

  await prisma.medicineNotification.deleteMany({
    where: {
      type: { in: [TYPE_EXPIRING, TYPE_EXPIRED] },
      medicine_batch: { OR: [{ quantity_on_hand: 0 }, { expiry_date: { gt: cutoff } }] },
    },
  });

  // Sweep 2: medicine-scoped low stock.
  const medicines = await prisma.medicine.findMany({
    where: { is_active: true },
    include: { batches: { select: { quantity_on_hand: true } } },
  });

  for (const medicine of medicines) {
    const total = medicine.batches.reduce((sum, b) => sum + b.quantity_on_hand, 0);
    const isLow = medicine.min_stock > 0 && total <= medicine.min_stock;

    const existing = await prisma.medicineNotification.findUnique({
      where: { type_medicine_id: { type: TYPE_LOW_STOCK, medicine_id: medicine.id } },
    });

    if (!isLow) {
      if (existing) await prisma.medicineNotification.delete({ where: { id: existing.id } });
      continue;
    }

    const level = total === 0 ? "overdue" : "due_soon";
    const title = `ยาสต๊อกต่ำ: ${medicine.generic_name}`;
    const message = `คงเหลือ ${total} ${medicine.unit} (ขั้นต่ำที่ควรมี ${medicine.min_stock} ${medicine.unit})`;

    if (!existing) {
      await prisma.medicineNotification.create({
        data: { type: TYPE_LOW_STOCK, level, medicine_id: medicine.id, title, message, is_read: false },
      });
    } else if (existing.level !== level) {
      await prisma.medicineNotification.update({ where: { id: existing.id }, data: { level, message, is_read: false } });
    }
  }
}

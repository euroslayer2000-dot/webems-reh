import { prisma } from "@/lib/prisma";

const TYPE_EQUIPMENT_DUE = "equipment_borrow_due";

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
 * Upserts due-soon/overdue notifications for open loans, matching the
 * Laravel app's Notification::syncEquipmentDueSoon() semantics: new rows
 * start unread; an escalation (due_soon -> overdue) re-flags unread; same
 * level leaves the existing row (message + read state) untouched. Loans
 * that got returned (or lost their due_date) have their notification
 * purged. Runs on a schedule (see api/cron/sync-notifications) instead of
 * on every admin page load like the original.
 */
export async function syncEquipmentDueSoon(days = 3): Promise<void> {
  const today = startOfDay(new Date());
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + days);

  const openLoans = await prisma.equipmentBorrow.findMany({
    where: { return_date: null, due_date: { not: null, lte: cutoff } },
    include: { equipment: true },
  });

  for (const loan of openLoans) {
    if (!loan.due_date) continue;
    const due = startOfDay(loan.due_date);
    const diff = daysBetween(today, due);
    const level = diff < 0 ? "overdue" : "due_soon";
    const title = `กำหนดคืนครุภัณฑ์: ${loan.equipment.name}`;
    const message =
      `ผู้ยืม ${loan.borrower_name} — กำหนดคืน ${formatThaiDate(due)}` +
      (diff < 0
        ? ` (เกินกำหนดแล้ว ${-diff} วัน)`
        : diff === 0
          ? " (ครบกำหนดวันนี้)"
          : ` (เหลืออีก ${diff} วัน)`);

    const existing = await prisma.notification.findUnique({
      where: { type_borrow_id: { type: TYPE_EQUIPMENT_DUE, borrow_id: loan.id } },
    });

    if (!existing) {
      await prisma.notification.create({
        data: { type: TYPE_EQUIPMENT_DUE, borrow_id: loan.id, level, title, message, is_read: false },
      });
    } else if (existing.level !== level) {
      await prisma.notification.update({ where: { id: existing.id }, data: { level, message, is_read: false } });
    }
  }

  await prisma.notification.deleteMany({
    where: {
      type: TYPE_EQUIPMENT_DUE,
      borrow: { OR: [{ return_date: { not: null } }, { due_date: null }] },
    },
  });
}

export type Period = "day" | "week" | "month" | "year" | "all";

export const PERIOD_LABELS: Record<Period, string> = {
  day: "วันนี้",
  week: "สัปดาห์นี้",
  month: "เดือนนี้",
  year: "ปีนี้",
  all: "ทั้งหมด",
};

/** Date range for a dashboard period filter, matching the Laravel app's
 * scopeInPeriod() (YEARWEEK mode 1 = Monday-start ISO week). */
export function periodDateRange(period: Period): { gte: Date; lte: Date } | null {
  const now = new Date();
  const today = startOfDay(now);

  if (period === "day") {
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    return { gte: today, lte: end };
  }

  if (period === "week") {
    const dayIndex = (today.getDay() + 6) % 7; // Mon=0 ... Sun=6
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayIndex);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { gte: monday, lte: sunday };
  }

  if (period === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  if (period === "year") {
    const start = new Date(today.getFullYear(), 0, 1);
    const end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  return null;
}

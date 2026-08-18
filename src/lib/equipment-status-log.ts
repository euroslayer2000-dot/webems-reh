import { prisma } from "@/lib/prisma";
import type { equipment_status } from "@prisma/client";

/** Records an equipment status transition. No-ops when the status didn't
 * actually change (e.g. editing other fields without touching status). */
export async function logStatusChange(
  equipmentId: number,
  oldStatus: equipment_status | null,
  newStatus: equipment_status,
  note?: string | null
): Promise<void> {
  if (oldStatus === newStatus) return;
  await prisma.equipmentStatusLog.create({
    data: { equipment_id: equipmentId, old_status: oldStatus, new_status: newStatus, note: note ?? null },
  });
}

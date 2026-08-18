"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";

const scheduleSchema = z.object({
  equipment_id: z.coerce.number().int(),
  title: z.string().min(1, "กรุณากรอกรายการบำรุงรักษา").max(200),
  scheduled_date: z.string().min(1, "กรุณาระบุวันครบกำหนด"),
  note: z.string().optional(),
});

export type ScheduleFormState = { ok: boolean; errors?: Record<string, string> };

export async function createMaintenanceSchedule(_prev: ScheduleFormState, formData: FormData): Promise<ScheduleFormState> {
  await requireActionAccess("equipment");
  const parsed = scheduleSchema.safeParse({
    equipment_id: formData.get("equipment_id"),
    title: formData.get("title"),
    scheduled_date: formData.get("scheduled_date"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, errors };
  }

  await prisma.equipmentMaintenanceSchedule.create({
    data: {
      equipment_id: parsed.data.equipment_id,
      title: parsed.data.title,
      scheduled_date: new Date(parsed.data.scheduled_date),
      note: parsed.data.note || null,
    },
  });

  redirectWithFlash(`/admin/equipment/${parsed.data.equipment_id}/history`, "เพิ่มกำหนดการบำรุงรักษาเรียบร้อยแล้ว");
}

export async function completeMaintenanceSchedule(formData: FormData): Promise<void> {
  await requireActionAccess("equipment");
  const id = Number(formData.get("id"));
  const equipmentId = Number(formData.get("equipment_id"));

  await prisma.equipmentMaintenanceSchedule.update({ where: { id }, data: { completed_date: new Date() } });

  redirectWithFlash(`/admin/equipment/${equipmentId}/history`, "บันทึกว่าดำเนินการแล้วเรียบร้อย");
}

export async function deleteMaintenanceSchedule(formData: FormData): Promise<void> {
  await requireActionAccess("equipment");
  const id = Number(formData.get("id"));
  const equipmentId = Number(formData.get("equipment_id"));

  await prisma.equipmentMaintenanceSchedule.delete({ where: { id } });

  redirectWithFlash(`/admin/equipment/${equipmentId}/history`, "ลบกำหนดการเรียบร้อยแล้ว");
}

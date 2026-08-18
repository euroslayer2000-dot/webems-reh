"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";

const createSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อรอบตรวจนับ").max(200),
});

export type StockTakeFormState = { ok: boolean; errors?: Record<string, string> };

export async function createStockTake(_prev: StockTakeFormState, formData: FormData): Promise<StockTakeFormState> {
  await requireActionAccess("equipment");
  const parsed = createSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, errors };
  }

  const equipmentIds = await prisma.equipment.findMany({ select: { id: true } });

  const stockTake = await prisma.equipmentStockTake.create({ data: { title: parsed.data.title } });
  if (equipmentIds.length > 0) {
    await prisma.equipmentStockTakeItem.createMany({
      data: equipmentIds.map((e) => ({ stock_take_id: stockTake.id, equipment_id: e.id })),
    });
  }

  redirectWithFlash(`/admin/equipment-stock-take/${stockTake.id}`, "เริ่มรอบตรวจนับเรียบร้อยแล้ว");
}

export async function toggleStockTakeItem(formData: FormData): Promise<void> {
  await requireActionAccess("equipment");
  const id = Number(formData.get("id"));
  const stockTakeId = Number(formData.get("stock_take_id"));
  const checked = formData.get("checked") === "1";

  await prisma.equipmentStockTakeItem.update({
    where: { id },
    data: { checked: !checked, checked_at: !checked ? new Date() : null },
  });

  redirectWithFlash(`/admin/equipment-stock-take/${stockTakeId}`, checked ? "ยกเลิกการทำเครื่องหมายแล้ว" : "บันทึกว่าพบครุภัณฑ์แล้ว");
}

export async function completeStockTake(formData: FormData): Promise<void> {
  await requireActionAccess("equipment");
  const id = Number(formData.get("id"));

  await prisma.equipmentStockTake.update({ where: { id }, data: { completed_at: new Date() } });

  redirectWithFlash(`/admin/equipment-stock-take/${id}`, "ปิดรอบตรวจนับเรียบร้อยแล้ว");
}

export async function deleteStockTake(formData: FormData): Promise<void> {
  await requireActionAccess("equipment");
  const id = Number(formData.get("id"));

  await prisma.equipmentStockTake.delete({ where: { id } });

  redirectWithFlash("/admin/equipment-stock-take", "ลบรอบตรวจนับเรียบร้อยแล้ว");
}

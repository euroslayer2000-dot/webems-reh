"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";

const categorySchema = z.object({
  code: z.string().min(1, "กรุณากรอกรหัสหมวดหมู่").max(20),
  name: z.string().min(1, "กรุณากรอกชื่อหมวดหมู่").max(120),
});

export type EquipmentCategoryFormState = {
  ok: boolean;
  errors?: Partial<Record<"code" | "name", string>>;
};

function parse(formData: FormData) {
  return categorySchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
  });
}

function toErrors(error: z.ZodError<z.infer<typeof categorySchema>>): EquipmentCategoryFormState["errors"] {
  const errors: EquipmentCategoryFormState["errors"] = {};
  for (const issue of error.issues) errors[issue.path[0] as "code" | "name"] = issue.message;
  return errors;
}

export async function createEquipmentCategory(_prev: EquipmentCategoryFormState, formData: FormData): Promise<EquipmentCategoryFormState> {
  await requireActionAccess("equipmentcategory");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const dup = await prisma.equipmentCategory.findUnique({ where: { code: parsed.data.code } });
  if (dup) return { ok: false, errors: { code: "รหัสนี้ถูกใช้แล้ว" } };

  const count = await prisma.equipmentCategory.count();

  await prisma.equipmentCategory.create({
    data: { code: parsed.data.code, name: parsed.data.name, sort_order: count },
  });

  redirectWithFlash("/admin/equipment-category", "เพิ่มหมวดหมู่ครุภัณฑ์เรียบร้อยแล้ว");
}

export async function updateEquipmentCategory(id: number, _prev: EquipmentCategoryFormState, formData: FormData): Promise<EquipmentCategoryFormState> {
  await requireActionAccess("equipmentcategory");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const dup = await prisma.equipmentCategory.findFirst({ where: { code: parsed.data.code, id: { not: id } } });
  if (dup) return { ok: false, errors: { code: "รหัสนี้ถูกใช้แล้ว" } };

  await prisma.equipmentCategory.update({
    where: { id },
    data: { code: parsed.data.code, name: parsed.data.name },
  });

  redirectWithFlash("/admin/equipment-category", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function moveEquipmentCategory(formData: FormData): Promise<void> {
  await requireActionAccess("equipmentcategory");
  const id = Number(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";

  const siblings = await prisma.equipmentCategory.findMany({ orderBy: [{ sort_order: "asc" }, { id: "asc" }] });
  const index = siblings.findIndex((c) => c.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith >= 0 && swapWith < siblings.length) {
    const reordered = [...siblings];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    await prisma.$transaction(
      reordered.map((item, i) => prisma.equipmentCategory.update({ where: { id: item.id }, data: { sort_order: i } }))
    );
  }

  redirectWithFlash("/admin/equipment-category", "จัดลำดับใหม่เรียบร้อยแล้ว");
}

export async function deleteEquipmentCategory(formData: FormData): Promise<void> {
  await requireActionAccess("equipmentcategory");
  const id = Number(formData.get("id"));

  const inUse = await prisma.equipment.count({ where: { category_id: id } });
  if (inUse > 0) {
    redirectWithFlash("/admin/equipment-category", "มีครุภัณฑ์ใช้หมวดหมู่นี้อยู่ ไม่สามารถลบได้", "error");
  }

  await prisma.equipmentCategory.delete({ where: { id } });

  redirectWithFlash("/admin/equipment-category", "ลบหมวดหมู่ครุภัณฑ์เรียบร้อยแล้ว");
}

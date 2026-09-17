"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";

const categorySchema = z.object({
  code: z.string().min(1, "กรุณากรอกรหัสหมวดหมู่").max(20),
  name: z.string().min(1, "กรุณากรอกชื่อหมวดหมู่").max(120),
});

export type MedicineCategoryFormState = {
  ok: boolean;
  errors?: Partial<Record<"code" | "name", string>>;
};

function parse(formData: FormData) {
  return categorySchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
  });
}

function toErrors(error: z.ZodError<z.infer<typeof categorySchema>>): MedicineCategoryFormState["errors"] {
  const errors: MedicineCategoryFormState["errors"] = {};
  for (const issue of error.issues) errors[issue.path[0] as "code" | "name"] = issue.message;
  return errors;
}

export async function createMedicineCategory(_prev: MedicineCategoryFormState, formData: FormData): Promise<MedicineCategoryFormState> {
  await requireActionAccess("medicinecategory");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const dup = await prisma.medicineCategory.findUnique({ where: { code: parsed.data.code } });
  if (dup) return { ok: false, errors: { code: "รหัสนี้ถูกใช้แล้ว" } };

  const count = await prisma.medicineCategory.count();

  await prisma.medicineCategory.create({
    data: { code: parsed.data.code, name: parsed.data.name, sort_order: count },
  });

  redirectWithFlash("/admin/medicine-category", "เพิ่มหมวดหมู่ยาเรียบร้อยแล้ว");
}

export async function updateMedicineCategory(id: number, _prev: MedicineCategoryFormState, formData: FormData): Promise<MedicineCategoryFormState> {
  await requireActionAccess("medicinecategory");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const dup = await prisma.medicineCategory.findFirst({ where: { code: parsed.data.code, id: { not: id } } });
  if (dup) return { ok: false, errors: { code: "รหัสนี้ถูกใช้แล้ว" } };

  await prisma.medicineCategory.update({
    where: { id },
    data: { code: parsed.data.code, name: parsed.data.name },
  });

  redirectWithFlash("/admin/medicine-category", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function moveMedicineCategory(formData: FormData): Promise<void> {
  await requireActionAccess("medicinecategory");
  const id = Number(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";

  const siblings = await prisma.medicineCategory.findMany({ orderBy: [{ sort_order: "asc" }, { id: "asc" }] });
  const index = siblings.findIndex((c) => c.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith >= 0 && swapWith < siblings.length) {
    const reordered = [...siblings];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    await prisma.$transaction(
      reordered.map((item, i) => prisma.medicineCategory.update({ where: { id: item.id }, data: { sort_order: i } }))
    );
  }

  redirectWithFlash("/admin/medicine-category", "จัดลำดับใหม่เรียบร้อยแล้ว");
}

export async function deleteMedicineCategory(formData: FormData): Promise<void> {
  await requireActionAccess("medicinecategory");
  const id = Number(formData.get("id"));

  const inUse = await prisma.medicine.count({ where: { category_id: id } });
  if (inUse > 0) {
    redirectWithFlash("/admin/medicine-category", "มียาใช้หมวดหมู่นี้อยู่ ไม่สามารถลบได้", "error");
  }

  await prisma.medicineCategory.delete({ where: { id } });

  redirectWithFlash("/admin/medicine-category", "ลบหมวดหมู่ยาเรียบร้อยแล้ว");
}

"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { deleteUpload, saveUpload } from "@/lib/uploads-write";
import { redirectWithFlash } from "@/lib/flash-redirect";
import { logStatusChange } from "@/lib/equipment-status-log";

const STATUSES = ["available", "borrowed", "damaged", "maintenance", "disposed"] as const;

const equipmentSchema = z.object({
  code: z.string().min(1, "กรุณากรอกเลขครุภัณฑ์").max(50),
  name: z.string().min(1, "กรุณากรอกชื่อครุภัณฑ์").max(200),
  status: z.enum(STATUSES),
  category_id: z.string().optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  location: z.string().optional(),
  brand: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.string().optional(),
});

export type EquipmentFormState = {
  ok: boolean;
  errors?: Partial<Record<keyof z.infer<typeof equipmentSchema>, string>>;
};

function parse(formData: FormData) {
  return equipmentSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    status: formData.get("status"),
    category_id: formData.get("category_id") || undefined,
    description: formData.get("description") || undefined,
    unit: formData.get("unit") || undefined,
    location: formData.get("location") || undefined,
    brand: formData.get("brand") || undefined,
    purchase_date: formData.get("purchase_date") || undefined,
    purchase_price: formData.get("purchase_price") || undefined,
  });
}

function toErrors(error: z.ZodError<z.infer<typeof equipmentSchema>>): EquipmentFormState["errors"] {
  const errors: EquipmentFormState["errors"] = {};
  for (const issue of error.issues) errors[issue.path[0] as keyof z.infer<typeof equipmentSchema>] = issue.message;
  return errors;
}

function buildData(parsed: z.infer<typeof equipmentSchema>) {
  return {
    category_id: parsed.category_id ? Number(parsed.category_id) : null,
    code: parsed.code,
    name: parsed.name,
    description: parsed.description || null,
    unit: parsed.unit || "ชิ้น",
    location: parsed.location || null,
    brand: parsed.brand || null,
    status: parsed.status,
    purchase_date: parsed.purchase_date ? new Date(parsed.purchase_date) : null,
    purchase_price: parsed.purchase_price ? parsed.purchase_price : null,
  };
}

/** Saves a single named file field if present, deleting the previous upload on replace. */
async function handleImageField(formData: FormData, field: string, existingPath: string | null): Promise<string | null> {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) return existingPath;
  if (existingPath) await deleteUpload(existingPath);
  return saveUpload(file, "equipment");
}

export async function createEquipment(_prev: EquipmentFormState, formData: FormData): Promise<EquipmentFormState> {
  await requireActionAccess("equipment");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const dup = await prisma.equipment.findUnique({ where: { code: parsed.data.code } });
  if (dup) return { ok: false, errors: { code: "เลขครุภัณฑ์นี้ถูกใช้แล้ว" } };

  const photo = await handleImageField(formData, "photo", null);
  const photo2 = await handleImageField(formData, "photo2", null);
  const photo3 = await handleImageField(formData, "photo3", null);
  const warranty_document = await handleImageField(formData, "warranty_document", null);
  const receipt_document = await handleImageField(formData, "receipt_document", null);

  const created = await prisma.equipment.create({
    data: { ...buildData(parsed.data), photo, photo2, photo3, warranty_document, receipt_document },
  });
  await logStatusChange(created.id, null, created.status);

  redirectWithFlash("/admin/equipment", "เพิ่มครุภัณฑ์เรียบร้อยแล้ว");
}

export async function updateEquipment(id: number, _prev: EquipmentFormState, formData: FormData): Promise<EquipmentFormState> {
  await requireActionAccess("equipment");
  const existing = await prisma.equipment.findUniqueOrThrow({ where: { id } });

  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const dup = await prisma.equipment.findFirst({ where: { code: parsed.data.code, id: { not: id } } });
  if (dup) return { ok: false, errors: { code: "เลขครุภัณฑ์นี้ถูกใช้แล้ว" } };

  const photo = await handleImageField(formData, "photo", existing.photo);
  const photo2 = await handleImageField(formData, "photo2", existing.photo2);
  const photo3 = await handleImageField(formData, "photo3", existing.photo3);
  const warranty_document = await handleImageField(formData, "warranty_document", existing.warranty_document);
  const receipt_document = await handleImageField(formData, "receipt_document", existing.receipt_document);

  await prisma.equipment.update({
    where: { id },
    data: { ...buildData(parsed.data), photo, photo2, photo3, warranty_document, receipt_document },
  });
  await logStatusChange(id, existing.status, parsed.data.status);

  redirectWithFlash("/admin/equipment", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function deleteEquipment(formData: FormData): Promise<void> {
  await requireActionAccess("equipment");
  const id = Number(formData.get("id"));

  const openLoan = await prisma.equipmentBorrow.findFirst({ where: { equipment_id: id, return_date: null } });
  if (openLoan) {
    redirectWithFlash("/admin/equipment", "มีการยืมค้างอยู่ ไม่สามารถลบครุภัณฑ์นี้ได้", "error");
  }

  const item = await prisma.equipment.findUniqueOrThrow({ where: { id } });
  await deleteUpload(item.photo);
  await deleteUpload(item.photo2);
  await deleteUpload(item.photo3);
  await deleteUpload(item.warranty_document);
  await deleteUpload(item.receipt_document);
  await prisma.equipment.delete({ where: { id } });

  redirectWithFlash("/admin/equipment", "ลบครุภัณฑ์เรียบร้อยแล้ว");
}

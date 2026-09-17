"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { deleteUpload, saveUpload } from "@/lib/uploads-write";
import { redirectWithFlash } from "@/lib/flash-redirect";
import { MEDICINE_AUTO_CODE_PREFIX, isAutoMedicineCode } from "@/lib/medicine-code";

const CLASSIFICATIONS = ["general", "dangerous", "special_control", "psychotropic", "narcotic"] as const;
const STORAGE_CONDITIONS = ["room_temp", "refrigerated", "protect_light"] as const;

const medicineSchema = z.object({
  generic_name: z.string().min(1, "กรุณากรอกชื่อสามัญของยา").max(200),
  trade_name: z.string().optional(),
  dosage_form: z.string().optional(),
  strength: z.string().optional(),
  unit: z.string().optional(),
  classification: z.enum(CLASSIFICATIONS),
  storage_condition: z.enum(STORAGE_CONDITIONS),
  min_stock: z.string().optional(),
  category_id: z.string().optional(),
  description: z.string().optional(),
  is_active: z.string().optional(),
});

export type MedicineFormState = {
  ok: boolean;
  errors?: Partial<Record<keyof z.infer<typeof medicineSchema> | "code", string>>;
};

function parse(formData: FormData) {
  return medicineSchema.safeParse({
    generic_name: formData.get("generic_name"),
    trade_name: formData.get("trade_name") || undefined,
    dosage_form: formData.get("dosage_form") || undefined,
    strength: formData.get("strength") || undefined,
    unit: formData.get("unit") || undefined,
    classification: formData.get("classification"),
    storage_condition: formData.get("storage_condition"),
    min_stock: formData.get("min_stock") || undefined,
    category_id: formData.get("category_id") || undefined,
    description: formData.get("description") || undefined,
    is_active: formData.get("is_active") || undefined,
  });
}

function toErrors(error: z.ZodError<z.infer<typeof medicineSchema>>): MedicineFormState["errors"] {
  const errors: MedicineFormState["errors"] = {};
  for (const issue of error.issues) errors[issue.path[0] as keyof z.infer<typeof medicineSchema>] = issue.message;
  return errors;
}

function buildData(parsed: z.infer<typeof medicineSchema>) {
  return {
    category_id: parsed.category_id ? Number(parsed.category_id) : null,
    generic_name: parsed.generic_name,
    trade_name: parsed.trade_name || null,
    dosage_form: parsed.dosage_form || null,
    strength: parsed.strength || null,
    unit: parsed.unit || "เม็ด",
    classification: parsed.classification,
    storage_condition: parsed.storage_condition,
    min_stock: parsed.min_stock ? Number(parsed.min_stock) : 0,
    description: parsed.description || null,
    is_active: parsed.is_active === "1",
  };
}

/** Medicine without a real registered code gets an internal placeholder
 * (rather than making the column nullable), mirroring lib/equipment-code.ts's
 * approach for equipment. */
async function generateAutoCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${MEDICINE_AUTO_CODE_PREFIX}${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const exists = await prisma.medicine.findUnique({ where: { code: candidate } });
    if (!exists) return candidate;
  }
  throw new Error("ไม่สามารถสร้างรหัสยาอัตโนมัติได้ กรุณาลองใหม่");
}

async function resolveCode(
  formData: FormData,
  opts: { excludeId?: number; existingCode?: string | null }
): Promise<{ code: string } | { error: string }> {
  const mode = formData.get("code_mode") === "auto" ? "auto" : "manual";

  if (mode === "auto") {
    if (opts.existingCode && isAutoMedicineCode(opts.existingCode)) return { code: opts.existingCode };
    return { code: await generateAutoCode() };
  }

  const raw = String(formData.get("code") ?? "").trim();
  if (!raw) return { error: "กรุณากรอกรหัสยา" };
  if (raw.length > 50) return { error: "รหัสยาต้องไม่เกิน 50 ตัวอักษร" };

  const dup = await prisma.medicine.findFirst({
    where: opts.excludeId ? { code: raw, id: { not: opts.excludeId } } : { code: raw },
  });
  if (dup) return { error: "รหัสยานี้ถูกใช้แล้ว" };

  return { code: raw };
}

/** Saves the photo field if a new file was chosen, else keeps the existing
 * path — same discipline as equipment/actions.ts's resolveImageField: never
 * delete the old upload until the DB row already points at the new one. */
async function resolvePhoto(formData: FormData, existingPath: string | null): Promise<string | null> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return existingPath;
  return saveUpload(file, "medicine");
}

export async function createMedicine(_prev: MedicineFormState, formData: FormData): Promise<MedicineFormState> {
  await requireActionAccess("medicine");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const codeResult = await resolveCode(formData, {});
  if ("error" in codeResult) return { ok: false, errors: { code: codeResult.error } };

  const photo = await resolvePhoto(formData, null);

  await prisma.medicine.create({
    data: { ...buildData(parsed.data), code: codeResult.code, photo },
  });

  redirectWithFlash("/admin/medicine", "เพิ่มยาเรียบร้อยแล้ว");
}

export async function updateMedicine(id: number, _prev: MedicineFormState, formData: FormData): Promise<MedicineFormState> {
  await requireActionAccess("medicine");
  const existing = await prisma.medicine.findUniqueOrThrow({ where: { id } });

  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const codeResult = await resolveCode(formData, { excludeId: id, existingCode: existing.code });
  if ("error" in codeResult) return { ok: false, errors: { code: codeResult.error } };

  const photo = await resolvePhoto(formData, existing.photo);

  await prisma.medicine.update({
    where: { id },
    data: { ...buildData(parsed.data), code: codeResult.code, photo },
  });

  if (photo !== existing.photo) await deleteUpload(existing.photo);

  redirectWithFlash("/admin/medicine", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function deleteMedicine(formData: FormData): Promise<void> {
  await requireActionAccess("medicine");
  const id = Number(formData.get("id"));

  const inStockBatch = await prisma.medicineBatch.findFirst({ where: { medicine_id: id, quantity_on_hand: { gt: 0 } } });
  if (inStockBatch) {
    redirectWithFlash("/admin/medicine", "ยังมีสต๊อกคงเหลืออยู่ ไม่สามารถลบยานี้ได้ กรุณาตัดจำหน่าย/ปรับยอดให้เป็น 0 ก่อน", "error");
  }

  const item = await prisma.medicine.findUniqueOrThrow({ where: { id } });
  await deleteUpload(item.photo);
  await prisma.medicine.delete({ where: { id } });

  redirectWithFlash("/admin/medicine", "ลบยาเรียบร้อยแล้ว");
}

"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";

const aedSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสถานที่").max(150),
  lat: z.coerce.number().min(-90, "ละติจูดไม่ถูกต้อง").max(90, "ละติจูดไม่ถูกต้อง"),
  lng: z.coerce.number().min(-180, "ลองจิจูดไม่ถูกต้อง").max(180, "ลองจิจูดไม่ถูกต้อง"),
  address: z.string().max(255).optional(),
  detail: z.string().max(255).optional(),
  open_hours: z.string().max(150).optional(),
  phone: z.string().max(30).optional(),
});

export type AedFormState = {
  ok: boolean;
  errors?: Partial<Record<keyof z.infer<typeof aedSchema>, string>>;
};

function parse(formData: FormData) {
  return aedSchema.safeParse({
    name: formData.get("name"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    address: formData.get("address") || undefined,
    detail: formData.get("detail") || undefined,
    open_hours: formData.get("open_hours") || undefined,
    phone: formData.get("phone") || undefined,
  });
}

function toErrors(error: z.ZodError<z.infer<typeof aedSchema>>): AedFormState["errors"] {
  const errors: AedFormState["errors"] = {};
  for (const issue of error.issues) errors[issue.path[0] as keyof z.infer<typeof aedSchema>] = issue.message;
  return errors;
}

function buildData(parsed: z.infer<typeof aedSchema>, formData: FormData) {
  return {
    name: parsed.name,
    lat: parsed.lat,
    lng: parsed.lng,
    address: parsed.address || null,
    detail: parsed.detail || null,
    open_hours: parsed.open_hours || null,
    phone: parsed.phone || null,
    is_active: formData.get("is_active") === "on",
  };
}

export async function createAed(_prev: AedFormState, formData: FormData): Promise<AedFormState> {
  await requireActionAccess("aed");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  await prisma.aedLocation.create({ data: buildData(parsed.data, formData) });
  redirectWithFlash("/admin/aed", "เพิ่มจุดติดตั้งเครื่อง AED เรียบร้อยแล้ว");
}

export async function updateAed(id: number, _prev: AedFormState, formData: FormData): Promise<AedFormState> {
  await requireActionAccess("aed");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  await prisma.aedLocation.update({ where: { id }, data: buildData(parsed.data, formData) });
  redirectWithFlash("/admin/aed", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function toggleAed(formData: FormData): Promise<void> {
  await requireActionAccess("aed");
  const id = Number(formData.get("id"));
  const item = await prisma.aedLocation.findUniqueOrThrow({ where: { id } });
  await prisma.aedLocation.update({ where: { id }, data: { is_active: !item.is_active } });
  redirectWithFlash("/admin/aed", "เปลี่ยนสถานะเรียบร้อยแล้ว");
}

export async function deleteAed(formData: FormData): Promise<void> {
  await requireActionAccess("aed");
  const id = Number(formData.get("id"));
  await prisma.aedLocation.delete({ where: { id } });
  redirectWithFlash("/admin/aed", "ลบจุดติดตั้งเครื่อง AED เรียบร้อยแล้ว");
}

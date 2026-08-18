"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { deleteUpload, saveUpload } from "@/lib/uploads-write";
import { redirectWithFlash } from "@/lib/flash-redirect";

const stationSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อหน่วย").max(150),
  lat: z.coerce.number().min(-90, "ละติจูดไม่ถูกต้อง").max(90, "ละติจูดไม่ถูกต้อง"),
  lng: z.coerce.number().min(-180, "ลองจิจูดไม่ถูกต้อง").max(180, "ลองจิจูดไม่ถูกต้อง"),
  type: z.enum(["ALS", "BLS"]),
  code: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  service_area: z.string().optional(),
  description: z.string().optional(),
  sort_order: z.string().optional(),
});

export type StationFormState = {
  ok: boolean;
  errors?: Partial<Record<keyof z.infer<typeof stationSchema>, string>>;
};

function parse(formData: FormData) {
  return stationSchema.safeParse({
    name: formData.get("name"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    type: formData.get("type"),
    code: formData.get("code") || undefined,
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    service_area: formData.get("service_area") || undefined,
    description: formData.get("description") || undefined,
    sort_order: formData.get("sort_order") || undefined,
  });
}

function toErrors(error: z.ZodError<z.infer<typeof stationSchema>>): StationFormState["errors"] {
  const errors: StationFormState["errors"] = {};
  for (const issue of error.issues) errors[issue.path[0] as keyof z.infer<typeof stationSchema>] = issue.message;
  return errors;
}

function buildData(parsed: z.infer<typeof stationSchema>) {
  return {
    name: parsed.name,
    code: parsed.code || null,
    type: parsed.type,
    lat: parsed.lat,
    lng: parsed.lng,
    address: parsed.address || null,
    phone: parsed.phone || null,
    service_area: parsed.service_area || null,
    description: parsed.description || null,
    sort_order: parsed.sort_order ? Number(parsed.sort_order) : 0,
  };
}

export async function createStation(_prev: StationFormState, formData: FormData): Promise<StationFormState> {
  await requireActionAccess("station");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const photo = formData.get("photo");
  const photoPath = photo instanceof File && photo.size > 0 ? await saveUpload(photo, "stations") : null;

  await prisma.station.create({ data: { ...buildData(parsed.data), is_active: formData.get("is_active") === "on", photo: photoPath } });

  redirectWithFlash("/admin/station", "เพิ่มจุดหน่วยกู้ชีพเรียบร้อยแล้ว");
}

export async function updateStation(id: number, _prev: StationFormState, formData: FormData): Promise<StationFormState> {
  await requireActionAccess("station");
  const existing = await prisma.station.findUniqueOrThrow({ where: { id } });

  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const photo = formData.get("photo");
  let photoPath = existing.photo;
  if (photo instanceof File && photo.size > 0) {
    await deleteUpload(existing.photo);
    photoPath = await saveUpload(photo, "stations");
  }

  await prisma.station.update({ where: { id }, data: { ...buildData(parsed.data), is_active: formData.get("is_active") === "on", photo: photoPath } });

  redirectWithFlash("/admin/station", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function toggleStation(formData: FormData): Promise<void> {
  await requireActionAccess("station");
  const id = Number(formData.get("id"));
  const station = await prisma.station.findUniqueOrThrow({ where: { id } });
  await prisma.station.update({ where: { id }, data: { is_active: !station.is_active } });

  redirectWithFlash("/admin/station", "เปลี่ยนสถานะเรียบร้อยแล้ว");
}

export async function deleteStation(formData: FormData): Promise<void> {
  await requireActionAccess("station");
  const id = Number(formData.get("id"));
  const station = await prisma.station.findUniqueOrThrow({ where: { id } });

  await deleteUpload(station.photo);
  await prisma.station.delete({ where: { id } });

  redirectWithFlash("/admin/station", "ลบจุดหน่วยกู้ชีพเรียบร้อยแล้ว");
}

"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { deleteUpload, saveUpload } from "@/lib/uploads-write";
import { redirectWithFlash } from "@/lib/flash-redirect";

const personnelSchema = z
  .object({
    title: z.string().max(50, "คำนำหน้าต้องไม่เกิน 50 ตัวอักษร").optional(),
    first_name: z.string().min(1, "กรุณากรอกชื่อ").max(80),
    last_name: z.string().min(1, "กรุณากรอกนามสกุล").max(80),
    email: z.union([z.literal(""), z.string().email("อีเมลไม่ถูกต้อง").max(150, "อีเมลต้องไม่เกิน 150 ตัวอักษร")]).optional(),
    group_id: z.string().optional(),
    sort_order: z.string().optional(),
    bio: z.string().optional(),
  })
  .refine((data) => `${data.title ?? ""}${data.first_name} ${data.last_name}`.length <= 150, {
    message: "คำนำหน้า+ชื่อ+นามสกุลรวมกันยาวเกินไป (ไม่เกิน 150 ตัวอักษร)",
    path: ["first_name"],
  });

export type PersonnelFormState = {
  ok: boolean;
  errors?: Partial<Record<keyof z.infer<typeof personnelSchema>, string>>;
};

function parse(formData: FormData) {
  return personnelSchema.safeParse({
    title: formData.get("title") || undefined,
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email") || undefined,
    group_id: formData.get("group_id") || undefined,
    sort_order: formData.get("sort_order") || undefined,
    bio: formData.get("bio") || undefined,
  });
}

function toErrors(error: z.ZodError<z.infer<typeof personnelSchema>>): PersonnelFormState["errors"] {
  const errors: PersonnelFormState["errors"] = {};
  for (const issue of error.issues) errors[issue.path[0] as keyof z.infer<typeof personnelSchema>] = issue.message;
  return errors;
}

function buildData(parsed: z.infer<typeof personnelSchema>) {
  const title = (parsed.title ?? "").trim();
  const fullName = `${title}${parsed.first_name} ${parsed.last_name}`.trim();

  return {
    group_id: parsed.group_id ? Number(parsed.group_id) : null,
    title: title || null,
    first_name: parsed.first_name,
    last_name: parsed.last_name,
    full_name: fullName,
    email: parsed.email || null,
    bio: parsed.bio || null,
    sort_order: parsed.sort_order ? Number(parsed.sort_order) : 0,
  };
}

export async function createPersonnel(_prev: PersonnelFormState, formData: FormData): Promise<PersonnelFormState> {
  await requireActionAccess("personnel");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const photo = formData.get("photo");
  const photoPath = photo instanceof File && photo.size > 0 ? await saveUpload(photo, "personnel") : null;

  await prisma.personnel.create({
    data: { ...buildData(parsed.data), is_active: formData.get("is_active") === "on", photo: photoPath },
  });

  redirectWithFlash("/admin/personnel", "เพิ่มบุคลากรเรียบร้อยแล้ว");
}

export async function updatePersonnel(id: number, _prev: PersonnelFormState, formData: FormData): Promise<PersonnelFormState> {
  await requireActionAccess("personnel");
  const existing = await prisma.personnel.findUniqueOrThrow({ where: { id } });

  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const photo = formData.get("photo");
  let photoPath = existing.photo;
  if (photo instanceof File && photo.size > 0) {
    await deleteUpload(existing.photo);
    photoPath = await saveUpload(photo, "personnel");
  }

  await prisma.personnel.update({
    where: { id },
    data: { ...buildData(parsed.data), is_active: formData.get("is_active") === "on", photo: photoPath },
  });

  redirectWithFlash("/admin/personnel", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function togglePersonnel(formData: FormData): Promise<void> {
  await requireActionAccess("personnel");
  const id = Number(formData.get("id"));
  const person = await prisma.personnel.findUniqueOrThrow({ where: { id } });
  await prisma.personnel.update({ where: { id }, data: { is_active: !person.is_active } });

  redirectWithFlash("/admin/personnel", "เปลี่ยนสถานะเรียบร้อยแล้ว");
}

export async function deletePersonnel(formData: FormData): Promise<void> {
  await requireActionAccess("personnel");
  const id = Number(formData.get("id"));
  const person = await prisma.personnel.findUniqueOrThrow({ where: { id } });

  await deleteUpload(person.photo);
  await prisma.personnel.delete({ where: { id } });

  redirectWithFlash("/admin/personnel", "ลบบุคลากรเรียบร้อยแล้ว");
}

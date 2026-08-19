"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { deleteUpload, saveUpload } from "@/lib/uploads-write";
import { redirectWithFlash } from "@/lib/flash-redirect";

const structureSchema = z.object({
  title: z.string().max(200).optional(),
});

export type StructureFormState = { ok: boolean; errors?: { image?: string } };

export async function createStructure(_prev: StructureFormState, formData: FormData): Promise<StructureFormState> {
  await requireActionAccess("structure");
  const parsed = structureSchema.safeParse({ title: formData.get("title") || undefined });
  if (!parsed.success) return { ok: false };

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) return { ok: false, errors: { image: "กรุณาเลือกรูปภาพ" } };

  const imagePath = await saveUpload(image, "org-structure");
  const count = await prisma.orgStructure.count();

  await prisma.orgStructure.create({
    data: {
      title: parsed.data.title || null,
      sort_order: count,
      is_active: formData.get("is_active") === "on",
      image: imagePath,
    },
  });

  redirectWithFlash("/admin/structure", "เพิ่มรูปโครงสร้างหน่วยงานเรียบร้อยแล้ว");
}

export async function updateStructure(id: number, _prev: StructureFormState, formData: FormData): Promise<StructureFormState> {
  await requireActionAccess("structure");
  const existing = await prisma.orgStructure.findUniqueOrThrow({ where: { id } });

  const parsed = structureSchema.safeParse({ title: formData.get("title") || undefined });
  if (!parsed.success) return { ok: false };

  const image = formData.get("image");
  let imagePath = existing.image;
  if (image instanceof File && image.size > 0) {
    await deleteUpload(existing.image);
    imagePath = await saveUpload(image, "org-structure");
  }

  await prisma.orgStructure.update({
    where: { id },
    data: {
      title: parsed.data.title || null,
      is_active: formData.get("is_active") === "on",
      image: imagePath,
    },
  });

  redirectWithFlash("/admin/structure", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function moveStructure(formData: FormData): Promise<void> {
  await requireActionAccess("structure");
  const id = Number(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";

  const siblings = await prisma.orgStructure.findMany({ orderBy: [{ sort_order: "asc" }, { id: "asc" }] });
  const index = siblings.findIndex((item) => item.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith >= 0 && swapWith < siblings.length) {
    const reordered = [...siblings];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    await prisma.$transaction(
      reordered.map((item, i) => prisma.orgStructure.update({ where: { id: item.id }, data: { sort_order: i } }))
    );
  }

  redirectWithFlash("/admin/structure", "จัดลำดับใหม่เรียบร้อยแล้ว");
}

export async function toggleStructure(formData: FormData): Promise<void> {
  await requireActionAccess("structure");
  const id = Number(formData.get("id"));
  const item = await prisma.orgStructure.findUniqueOrThrow({ where: { id } });
  await prisma.orgStructure.update({ where: { id }, data: { is_active: !item.is_active } });

  redirectWithFlash("/admin/structure", "เปลี่ยนสถานะเรียบร้อยแล้ว");
}

export async function deleteStructure(formData: FormData): Promise<void> {
  await requireActionAccess("structure");
  const id = Number(formData.get("id"));
  const item = await prisma.orgStructure.findUniqueOrThrow({ where: { id } });

  await deleteUpload(item.image);
  await prisma.orgStructure.delete({ where: { id } });

  redirectWithFlash("/admin/structure", "ลบรูปโครงสร้างหน่วยงานเรียบร้อยแล้ว");
}

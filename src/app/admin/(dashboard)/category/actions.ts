"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { randomSlugSuffix, slugify } from "@/lib/slugify";
import { redirectWithFlash } from "@/lib/flash-redirect";

const categorySchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อหมวดหมู่").max(120),
  type: z.enum(["news", "download"]),
});

async function uniqueCategorySlug(base: string, type: "news" | "download"): Promise<string> {
  let slug = `${base}-${randomSlugSuffix()}`;
  while (await prisma.category.findFirst({ where: { slug, type } })) {
    slug = `${base}-${randomSlugSuffix()}`;
  }
  return slug;
}

export async function createCategory(formData: FormData): Promise<void> {
  await requireActionAccess("category");
  const parsed = categorySchema.safeParse({ name: formData.get("name"), type: formData.get("type") });
  if (!parsed.success) {
    redirectWithFlash("/admin/category", parsed.error.issues[0].message, "error");
  }

  const slug = await uniqueCategorySlug(slugify(parsed.data.name), parsed.data.type);
  await prisma.category.create({ data: { name: parsed.data.name, slug, type: parsed.data.type } });

  redirectWithFlash("/admin/category", "เพิ่มหมวดหมู่เรียบร้อยแล้ว");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireActionAccess("category");
  const id = Number(formData.get("id"));

  const [newsCount, downloadCount] = await Promise.all([
    prisma.news.count({ where: { category_id: id } }),
    prisma.download.count({ where: { category_id: id } }),
  ]);
  if (newsCount > 0 || downloadCount > 0) {
    redirectWithFlash("/admin/category", "มีข่าวหรือเอกสารดาวน์โหลดใช้หมวดหมู่นี้อยู่ ไม่สามารถลบได้", "error");
  }

  await prisma.category.delete({ where: { id } });

  redirectWithFlash("/admin/category", "ลบหมวดหมู่เรียบร้อยแล้ว");
}

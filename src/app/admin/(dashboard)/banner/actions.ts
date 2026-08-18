"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { deleteUpload, saveUpload } from "@/lib/uploads-write";
import { redirectWithFlash } from "@/lib/flash-redirect";

const bannerSchema = z.object({
  title: z.string().max(200).optional(),
  link_url: z.string().max(255).optional(),
  position: z.enum(["hero", "sidebar", "popup"]),
  sort_order: z.string().optional(),
});

export type BannerFormState = { ok: boolean; errors?: { image?: string } };

function parse(formData: FormData) {
  return bannerSchema.safeParse({
    title: formData.get("title") || undefined,
    link_url: formData.get("link_url") || undefined,
    position: formData.get("position") || "hero",
    sort_order: formData.get("sort_order") || undefined,
  });
}

export async function createBanner(_prev: BannerFormState, formData: FormData): Promise<BannerFormState> {
  await requireActionAccess("banner");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false };

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) return { ok: false, errors: { image: "กรุณาเลือกรูปภาพ" } };
  const imagePath = await saveUpload(image, "banners");

  await prisma.banner.create({
    data: {
      title: parsed.data.title || null,
      link_url: parsed.data.link_url || null,
      position: parsed.data.position,
      sort_order: parsed.data.sort_order ? Number(parsed.data.sort_order) : 0,
      is_active: formData.get("is_active") === "on",
      image: imagePath,
    },
  });

  redirectWithFlash("/admin/banner", "เพิ่มแบนเนอร์เรียบร้อยแล้ว");
}

export async function updateBanner(id: number, _prev: BannerFormState, formData: FormData): Promise<BannerFormState> {
  await requireActionAccess("banner");
  const existing = await prisma.banner.findUniqueOrThrow({ where: { id } });
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false };

  const image = formData.get("image");
  let imagePath = existing.image;
  if (image instanceof File && image.size > 0) {
    await deleteUpload(existing.image);
    imagePath = await saveUpload(image, "banners");
  }

  await prisma.banner.update({
    where: { id },
    data: {
      title: parsed.data.title || null,
      link_url: parsed.data.link_url || null,
      position: parsed.data.position,
      sort_order: parsed.data.sort_order ? Number(parsed.data.sort_order) : 0,
      is_active: formData.get("is_active") === "on",
      image: imagePath,
    },
  });

  redirectWithFlash("/admin/banner", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function toggleBanner(formData: FormData): Promise<void> {
  await requireActionAccess("banner");
  const id = Number(formData.get("id"));
  const banner = await prisma.banner.findUniqueOrThrow({ where: { id } });
  await prisma.banner.update({ where: { id }, data: { is_active: !banner.is_active } });

  redirectWithFlash("/admin/banner", "เปลี่ยนสถานะเรียบร้อยแล้ว");
}

export async function deleteBanner(formData: FormData): Promise<void> {
  await requireActionAccess("banner");
  const id = Number(formData.get("id"));
  const banner = await prisma.banner.findUniqueOrThrow({ where: { id } });

  await deleteUpload(banner.image);
  await prisma.banner.delete({ where: { id } });

  redirectWithFlash("/admin/banner", "ลบแบนเนอร์เรียบร้อยแล้ว");
}

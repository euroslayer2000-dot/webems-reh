"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { deleteUpload, saveUpload } from "@/lib/uploads-write";
import { redirectWithFlash } from "@/lib/flash-redirect";

const MAX_HERO_IMAGES = 5;

const bannerSchema = z.object({
  title: z.string().max(200).optional(),
  link_url: z.string().max(255).optional(),
});

export type BannerFormState = { ok: boolean; errors?: { image?: string } };

function parse(formData: FormData) {
  return bannerSchema.safeParse({
    title: formData.get("title") || undefined,
    link_url: formData.get("link_url") || undefined,
  });
}

export async function quickCreateBanner(formData: FormData): Promise<void> {
  await requireActionAccess("banner");

  const count = await prisma.banner.count({ where: { position: "hero" } });
  if (count >= MAX_HERO_IMAGES) {
    redirectWithFlash("/admin/banner", `อัปโหลดรูปภาพหน้าหลักได้สูงสุด ${MAX_HERO_IMAGES} รูป`, "error");
  }

  const image = formData.get("image");
  if (!(image instanceof File) || image.size === 0) {
    redirectWithFlash("/admin/banner", "กรุณาเลือกรูปภาพ", "error");
  }
  const imagePath = await saveUpload(image, "banners");

  await prisma.banner.create({
    data: {
      title: null,
      link_url: null,
      position: "hero",
      sort_order: count,
      is_active: true,
      image: imagePath,
    },
  });

  redirectWithFlash("/admin/banner", "เพิ่มรูปภาพหน้าหลักเรียบร้อยแล้ว");
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
      is_active: formData.get("is_active") === "on",
      image: imagePath,
    },
  });

  redirectWithFlash("/admin/banner", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function moveBanner(formData: FormData): Promise<void> {
  await requireActionAccess("banner");
  const id = Number(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";

  const current = await prisma.banner.findUniqueOrThrow({ where: { id } });
  const siblings = await prisma.banner.findMany({
    where: { position: current.position },
    orderBy: [{ sort_order: "asc" }, { id: "asc" }],
  });

  const index = siblings.findIndex((b) => b.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith >= 0 && swapWith < siblings.length) {
    const reordered = [...siblings];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    await prisma.$transaction(
      reordered.map((item, i) => prisma.banner.update({ where: { id: item.id }, data: { sort_order: i } }))
    );
  }

  redirectWithFlash("/admin/banner", "จัดลำดับใหม่เรียบร้อยแล้ว");
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

  redirectWithFlash("/admin/banner", "ลบรูปภาพเรียบร้อยแล้ว");
}

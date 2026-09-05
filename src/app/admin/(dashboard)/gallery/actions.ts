"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { randomSlugSuffix, slugify } from "@/lib/slugify";
import { deleteUpload, saveUpload } from "@/lib/uploads-write";
import { redirectWithFlash } from "@/lib/flash-redirect";

const gallerySchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่ออัลบั้ม").max(200),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export type GalleryFormState = { ok: boolean; errors?: { title?: string } };

async function uniqueSlug(base: string, exceptId?: number): Promise<string> {
  let slug = base;
  while (true) {
    const existing = await prisma.gallery.findFirst({ where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) } });
    if (!existing) return slug;
    slug = `${base}-${randomSlugSuffix()}`;
  }
}

export async function createGallery(_prev: GalleryFormState, formData: FormData): Promise<GalleryFormState> {
  await requireActionAccess("gallery");
  const parsed = gallerySchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: { title: parsed.error.issues[0]?.message } };

  const base = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const slug = await uniqueSlug(base);

  const coverImage = formData.get("cover_image");
  const coverImagePath = coverImage instanceof File && coverImage.size > 0 ? await saveUpload(coverImage, "gallery") : null;

  const gallery = await prisma.gallery.create({
    data: { title: parsed.data.title, slug, description: parsed.data.description || null, cover_image: coverImagePath },
  });

  redirectWithFlash(`/admin/gallery/${gallery.id}/edit`, "สร้างอัลบั้มแล้ว ทำการเพิ่มรูปภาพได้เลย");
}

export async function updateGallery(id: number, _prev: GalleryFormState, formData: FormData): Promise<GalleryFormState> {
  await requireActionAccess("gallery");
  const existing = await prisma.gallery.findUniqueOrThrow({ where: { id } });

  const parsed = gallerySchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: { title: parsed.error.issues[0]?.message } };

  const base = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const slug = await uniqueSlug(base, id);

  const coverImage = formData.get("cover_image");
  let coverImagePath = existing.cover_image;
  if (coverImage instanceof File && coverImage.size > 0) {
    coverImagePath = await saveUpload(coverImage, "gallery");
  }

  await prisma.gallery.update({
    where: { id },
    data: { title: parsed.data.title, slug, description: parsed.data.description || null, cover_image: coverImagePath },
  });
  if (coverImagePath !== existing.cover_image) await deleteUpload(existing.cover_image);

  redirectWithFlash(`/admin/gallery/${id}/edit`, "บันทึกอัลบั้มเรียบร้อยแล้ว");
}

export async function addGalleryImages(id: number, formData: FormData): Promise<void> {
  await requireActionAccess("gallery");
  const gallery = await prisma.gallery.findUniqueOrThrow({ where: { id } });
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);

  let count = 0;
  let coverImagePath = gallery.cover_image;
  for (const file of files) {
    const path = await saveUpload(file, "gallery");
    await prisma.galleryImage.create({ data: { gallery_id: id, image_path: path, sort_order: 0 } });
    if (!coverImagePath && count === 0) coverImagePath = path;
    count++;
  }
  if (coverImagePath !== gallery.cover_image) {
    await prisma.gallery.update({ where: { id }, data: { cover_image: coverImagePath } });
  }

  redirectWithFlash(`/admin/gallery/${id}/edit`, `อัปโหลดรูปสำเร็จ ${count} รูป`);
}

export async function deleteGalleryImage(formData: FormData): Promise<void> {
  await requireActionAccess("gallery");
  const imageId = Number(formData.get("imageId"));
  const galleryId = Number(formData.get("galleryId"));
  const image = await prisma.galleryImage.findUniqueOrThrow({ where: { id: imageId } });

  await deleteUpload(image.image_path);
  await prisma.galleryImage.delete({ where: { id: imageId } });

  // Deleting the image currently used as the album cover would otherwise
  // leave cover_image pointing at a now-deleted file.
  const gallery = await prisma.gallery.findUniqueOrThrow({ where: { id: galleryId } });
  if (gallery.cover_image === image.image_path) {
    await prisma.gallery.update({ where: { id: galleryId }, data: { cover_image: null } });
  }

  redirectWithFlash(`/admin/gallery/${galleryId}/edit`, "ลบรูปเรียบร้อยแล้ว");
}

export async function deleteGallery(formData: FormData): Promise<void> {
  await requireActionAccess("gallery");
  const id = Number(formData.get("id"));
  const gallery = await prisma.gallery.findUniqueOrThrow({ where: { id }, include: { images: true } });

  for (const image of gallery.images) await deleteUpload(image.image_path);
  await deleteUpload(gallery.cover_image);
  await prisma.gallery.delete({ where: { id } });

  redirectWithFlash("/admin/gallery", "ลบอัลบั้มเรียบร้อยแล้ว");
}

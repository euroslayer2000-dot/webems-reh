"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { randomSlugSuffix, slugify } from "@/lib/slugify";
import { deleteUpload, saveUpload } from "@/lib/uploads-write";
import { redirectWithFlash } from "@/lib/flash-redirect";

const courseSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อหลักสูตร").max(200),
  slug: z.string().optional(),
  short_description: z.string().max(500, "คำอธิบายต้องไม่เกิน 500 ตัวอักษร").optional(),
});

export type CourseFormState = {
  ok: boolean;
  errors?: Partial<Record<keyof z.infer<typeof courseSchema>, string>>;
};

async function uniqueSlug(base: string, exceptId?: number): Promise<string> {
  let slug = base;
  while (true) {
    const existing = await prisma.course.findFirst({ where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) } });
    if (!existing) return slug;
    slug = `${base}-${randomSlugSuffix()}`;
  }
}

function parse(formData: FormData) {
  return courseSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    short_description: formData.get("short_description") || undefined,
  });
}

function toErrors(error: z.ZodError<z.infer<typeof courseSchema>>): CourseFormState["errors"] {
  const errors: NonNullable<CourseFormState["errors"]> = {};
  for (const issue of error.issues) errors[issue.path[0] as keyof z.infer<typeof courseSchema>] = issue.message;
  return errors;
}

export async function createCourse(_prev: CourseFormState, formData: FormData): Promise<CourseFormState> {
  await requireActionAccess("course");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const base = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const slug = await uniqueSlug(base);

  const coverImage = formData.get("cover_image");
  const coverImagePath = coverImage instanceof File && coverImage.size > 0 ? await saveUpload(coverImage, "course") : null;

  const count = await prisma.course.count();

  await prisma.course.create({
    data: {
      title: parsed.data.title,
      slug,
      short_description: parsed.data.short_description || null,
      cover_image: coverImagePath,
      sort_order: count,
      is_active: formData.get("is_active") === "on",
    },
  });

  redirectWithFlash("/admin/course", "เพิ่มหลักสูตรเรียบร้อยแล้ว");
}

export async function updateCourse(id: number, _prev: CourseFormState, formData: FormData): Promise<CourseFormState> {
  await requireActionAccess("course");
  const existing = await prisma.course.findUniqueOrThrow({ where: { id } });

  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const base = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const slug = await uniqueSlug(base, id);

  const coverImage = formData.get("cover_image");
  let coverImagePath = existing.cover_image;
  if (coverImage instanceof File && coverImage.size > 0) {
    coverImagePath = await saveUpload(coverImage, "course");
  }

  await prisma.course.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug,
      short_description: parsed.data.short_description || null,
      cover_image: coverImagePath,
      is_active: formData.get("is_active") === "on",
    },
  });
  if (coverImagePath !== existing.cover_image) await deleteUpload(existing.cover_image);

  redirectWithFlash("/admin/course", "บันทึกหลักสูตรเรียบร้อยแล้ว");
}

export async function moveCourse(formData: FormData): Promise<void> {
  await requireActionAccess("course");
  const id = Number(formData.get("id"));
  const direction = formData.get("direction") === "up" ? "up" : "down";

  const siblings = await prisma.course.findMany({ orderBy: [{ sort_order: "asc" }, { id: "asc" }] });
  const index = siblings.findIndex((c) => c.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith >= 0 && swapWith < siblings.length) {
    const reordered = [...siblings];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    await prisma.$transaction(
      reordered.map((item, i) => prisma.course.update({ where: { id: item.id }, data: { sort_order: i } }))
    );
  }

  redirectWithFlash("/admin/course", "จัดลำดับใหม่เรียบร้อยแล้ว");
}

export async function toggleCourse(formData: FormData): Promise<void> {
  await requireActionAccess("course");
  const id = Number(formData.get("id"));
  const course = await prisma.course.findUniqueOrThrow({ where: { id } });
  await prisma.course.update({ where: { id }, data: { is_active: !course.is_active } });

  redirectWithFlash("/admin/course", "เปลี่ยนสถานะเรียบร้อยแล้ว");
}

export async function deleteCourse(formData: FormData): Promise<void> {
  await requireActionAccess("course");
  const id = Number(formData.get("id"));
  const course = await prisma.course.findUniqueOrThrow({ where: { id } });

  await deleteUpload(course.cover_image);
  await prisma.course.delete({ where: { id } });

  redirectWithFlash("/admin/course", "ลบหลักสูตรเรียบร้อยแล้ว");
}

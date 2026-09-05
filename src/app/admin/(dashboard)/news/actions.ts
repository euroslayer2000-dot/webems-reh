"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { randomSlugSuffix, slugify } from "@/lib/slugify";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { deleteUpload, saveUpload } from "@/lib/uploads-write";
import { redirectWithFlash } from "@/lib/flash-redirect";

const newsSchema = z.object({
  title: z.string().min(1, "กรุณากรอกหัวข้อข่าว").max(255),
  status: z.enum(["draft", "published"]),
  category_id: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().optional(),
  slug: z.string().optional(),
});

export type NewsFormState = {
  ok: boolean;
  errors?: Partial<Record<keyof z.infer<typeof newsSchema>, string>>;
};

async function uniqueSlug(base: string, exceptId?: number): Promise<string> {
  let slug = base;
  while (true) {
    const existing = await prisma.news.findFirst({ where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) } });
    if (!existing) return slug;
    slug = `${base}-${randomSlugSuffix()}`;
  }
}

function parse(formData: FormData) {
  return newsSchema.safeParse({
    title: formData.get("title"),
    status: formData.get("status"),
    category_id: formData.get("category_id") || undefined,
    excerpt: formData.get("excerpt") || undefined,
    content: formData.get("content") || undefined,
    slug: formData.get("slug") || undefined,
  });
}

function toErrors(error: z.ZodError<z.infer<typeof newsSchema>>): NewsFormState["errors"] {
  const errors: NewsFormState["errors"] = {};
  for (const issue of error.issues) errors[issue.path[0] as keyof z.infer<typeof newsSchema>] = issue.message;
  return errors;
}

export async function createNews(_prev: NewsFormState, formData: FormData): Promise<NewsFormState> {
  const user = await requireActionAccess("news");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const base = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const slug = await uniqueSlug(base);

  const coverImage = formData.get("cover_image");
  const coverImagePath = coverImage instanceof File && coverImage.size > 0 ? await saveUpload(coverImage, "news") : null;

  await prisma.news.create({
    data: {
      title: parsed.data.title,
      slug,
      category_id: parsed.data.category_id ? Number(parsed.data.category_id) : null,
      excerpt: parsed.data.excerpt || null,
      content: sanitizeRichText(parsed.data.content || ""),
      status: parsed.data.status,
      published_at: parsed.data.status === "published" ? new Date() : null,
      author_id: Number(user.id),
      cover_image: coverImagePath,
    },
  });

  redirectWithFlash("/admin/news", "เพิ่มข่าวเรียบร้อยแล้ว");
}

export async function updateNews(id: number, _prev: NewsFormState, formData: FormData): Promise<NewsFormState> {
  await requireActionAccess("news");
  const existing = await prisma.news.findUniqueOrThrow({ where: { id } });

  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const base = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const slug = await uniqueSlug(base, id);

  const coverImage = formData.get("cover_image");
  let coverImagePath = existing.cover_image;
  if (coverImage instanceof File && coverImage.size > 0) {
    coverImagePath = await saveUpload(coverImage, "news");
  }

  await prisma.news.update({
    where: { id },
    data: {
      title: parsed.data.title,
      slug,
      category_id: parsed.data.category_id ? Number(parsed.data.category_id) : null,
      excerpt: parsed.data.excerpt || null,
      content: sanitizeRichText(parsed.data.content || ""),
      status: parsed.data.status,
      published_at: parsed.data.status === "published" && !existing.published_at ? new Date() : existing.published_at,
      cover_image: coverImagePath,
    },
  });
  if (coverImagePath !== existing.cover_image) await deleteUpload(existing.cover_image);

  redirectWithFlash("/admin/news", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function deleteNews(formData: FormData): Promise<void> {
  await requireActionAccess("news");
  const id = Number(formData.get("id"));
  const article = await prisma.news.findUniqueOrThrow({ where: { id } });

  await deleteUpload(article.cover_image);
  await prisma.news.delete({ where: { id } });

  redirectWithFlash("/admin/news", "ลบข่าวเรียบร้อยแล้ว");
}

export async function toggleNews(formData: FormData): Promise<void> {
  await requireActionAccess("news");
  const id = Number(formData.get("id"));
  const article = await prisma.news.findUniqueOrThrow({ where: { id } });
  const newStatus = article.status === "published" ? "draft" : "published";

  await prisma.news.update({
    where: { id },
    data: {
      status: newStatus,
      published_at: newStatus === "published" && !article.published_at ? new Date() : article.published_at,
    },
  });

  redirectWithFlash("/admin/news", newStatus === "published" ? "เผยแพร่ข่าวแล้ว" : "เปลี่ยนเป็นแบบร่างแล้ว");
}

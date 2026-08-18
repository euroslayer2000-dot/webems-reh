"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { deleteUpload, saveUpload } from "@/lib/uploads-write";
import { redirectWithFlash } from "@/lib/flash-redirect";

const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx"];
const MAX_SIZE = 20 * 1024 * 1024;

const downloadSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อเอกสาร").max(255),
  category_id: z.string().optional(),
  description: z.string().optional(),
});

export type DownloadFormState = { ok: boolean; errors?: { title?: string; file?: string } };

function fileExt(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function validateFile(file: File | null): string | null {
  if (!file || file.size === 0) return null;
  if (!ALLOWED_EXTENSIONS.includes(fileExt(file.name))) return "รองรับเฉพาะไฟล์ pdf, doc, docx, xls, xlsx";
  if (file.size > MAX_SIZE) return "ขนาดไฟล์ต้องไม่เกิน 20MB";
  return null;
}

export async function createDownload(_prev: DownloadFormState, formData: FormData): Promise<DownloadFormState> {
  await requireActionAccess("download");
  const parsed = downloadSchema.safeParse({
    title: formData.get("title"),
    category_id: formData.get("category_id") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: { title: parsed.error.issues[0]?.message } };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, errors: { file: "กรุณาเลือกไฟล์เอกสาร" } };
  const fileError = validateFile(file);
  if (fileError) return { ok: false, errors: { file: fileError } };

  const path = await saveUpload(file, "documents");

  await prisma.download.create({
    data: {
      title: parsed.data.title,
      category_id: parsed.data.category_id ? Number(parsed.data.category_id) : null,
      description: parsed.data.description || null,
      file_path: path,
      file_type: fileExt(file.name),
      file_size: file.size,
    },
  });

  redirectWithFlash("/admin/download", "เพิ่มเอกสารเรียบร้อยแล้ว");
}

export async function updateDownload(id: number, _prev: DownloadFormState, formData: FormData): Promise<DownloadFormState> {
  await requireActionAccess("download");
  const existing = await prisma.download.findUniqueOrThrow({ where: { id } });

  const parsed = downloadSchema.safeParse({
    title: formData.get("title"),
    category_id: formData.get("category_id") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, errors: { title: parsed.error.issues[0]?.message } };

  const file = formData.get("file") as File | null;
  const fileError = validateFile(file);
  if (fileError) return { ok: false, errors: { file: fileError } };

  const data: {
    title: string;
    category_id: number | null;
    description: string | null;
    file_path?: string;
    file_type?: string;
    file_size?: number;
  } = {
    title: parsed.data.title,
    category_id: parsed.data.category_id ? Number(parsed.data.category_id) : null,
    description: parsed.data.description || null,
  };

  if (file && file.size > 0) {
    await deleteUpload(existing.file_path);
    data.file_path = await saveUpload(file, "documents");
    data.file_type = fileExt(file.name);
    data.file_size = file.size;
  }

  await prisma.download.update({ where: { id }, data });

  redirectWithFlash("/admin/download", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function deleteDownload(formData: FormData): Promise<void> {
  await requireActionAccess("download");
  const id = Number(formData.get("id"));
  const doc = await prisma.download.findUniqueOrThrow({ where: { id } });

  await deleteUpload(doc.file_path);
  await prisma.download.delete({ where: { id } });

  redirectWithFlash("/admin/download", "ลบเอกสารเรียบร้อยแล้ว");
}

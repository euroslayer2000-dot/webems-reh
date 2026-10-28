"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hit, tooManyAttempts } from "@/lib/rate-limit";

const MAX_PENDING_PER_EQUIPMENT = 5;

const requestSchema = z.object({
  borrower_name: z.string().trim().min(1, "กรุณากรอกชื่อ-นามสกุล").max(150),
  borrower_contact: z.string().trim().min(1, "กรุณากรอกเบอร์โทรศัพท์ติดต่อ").max(150),
  due_date: z.string().optional(),
  note: z.string().trim().max(1000).optional(),
});

export type BorrowRequestState = {
  ok: boolean;
  error?: string;
  errors?: Partial<Record<keyof z.infer<typeof requestSchema>, string>>;
};

export async function submitBorrowRequest(
  equipmentId: number,
  _prev: BorrowRequestState,
  formData: FormData
): Promise<BorrowRequestState> {
  // Honeypot: real users never see or fill this field.
  if (formData.get("website")) return { ok: true };

  const parsed = requestSchema.safeParse({
    borrower_name: formData.get("borrower_name"),
    borrower_contact: formData.get("borrower_contact"),
    due_date: formData.get("due_date") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    const errors: BorrowRequestState["errors"] = {};
    for (const issue of parsed.error.issues) {
      errors[issue.path[0] as keyof z.infer<typeof requestSchema>] = issue.message;
    }
    return { ok: false, errors };
  }

  let dueDate: Date | null = null;
  if (parsed.data.due_date) {
    dueDate = new Date(parsed.data.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(dueDate.getTime()) || dueDate < today) {
      return { ok: false, errors: { due_date: "กำหนดคืนต้องไม่เป็นวันที่ผ่านมาแล้ว" } };
    }
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateKey = `borrow-request:${ip}`;
  if (tooManyAttempts(rateKey)) {
    return { ok: false, error: "ส่งคำร้องบ่อยเกินไป กรุณาลองใหม่ภายหลัง" };
  }
  hit(rateKey);

  const item = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (!item || item.status !== "available") {
    return { ok: false, error: "ครุภัณฑ์ชิ้นนี้ไม่พร้อมให้ยืม" };
  }

  const pending = await prisma.equipmentBorrow.findMany({
    where: { equipment_id: equipmentId, request_status: "pending" },
    select: { borrower_contact: true },
  });
  if (pending.some((p) => p.borrower_contact === parsed.data.borrower_contact)) {
    return { ok: false, error: "คุณได้ส่งคำร้องยืมครุภัณฑ์ชิ้นนี้ไปแล้ว กรุณารอเจ้าหน้าที่ติดต่อกลับ" };
  }
  if (pending.length >= MAX_PENDING_PER_EQUIPMENT) {
    return { ok: false, error: "มีคำร้องขอยืมครุภัณฑ์ชิ้นนี้รออยู่หลายรายการแล้ว กรุณาติดต่อเจ้าหน้าที่โดยตรง" };
  }

  const now = new Date();
  await prisma.equipmentBorrow.create({
    data: {
      equipment_id: equipmentId,
      borrower_name: parsed.data.borrower_name,
      borrower_contact: parsed.data.borrower_contact,
      borrow_date: now,
      requested_at: now,
      due_date: dueDate,
      note: parsed.data.note || null,
      request_status: "pending",
    },
  });

  return { ok: true };
}

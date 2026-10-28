"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";
import { logStatusChange } from "@/lib/equipment-status-log";

const createSchema = z.object({
  equipment_id: z.coerce.number().int(),
  borrower_name: z.string().min(1, "กรุณากรอกชื่อผู้ยืม").max(150),
  borrower_contact: z.string().optional(),
  borrow_date: z.string().min(1, "กรุณาระบุวันที่ยืม"),
  due_date: z.string().optional(),
  note: z.string().optional(),
});

export type BorrowFormState = { ok: boolean; errors?: Record<string, string> };

export async function createBorrow(_prev: BorrowFormState, formData: FormData): Promise<BorrowFormState> {
  await requireActionAccess("equipmentborrow");
  const parsed = createSchema.safeParse({
    equipment_id: formData.get("equipment_id"),
    borrower_name: formData.get("borrower_name"),
    borrower_contact: formData.get("borrower_contact") || undefined,
    borrow_date: formData.get("borrow_date"),
    due_date: formData.get("due_date") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, errors };
  }

  const item = await prisma.equipment.findUnique({ where: { id: parsed.data.equipment_id } });
  if (!item || item.status !== "available") {
    redirectWithFlash("/admin/equipment-borrow/create", "ครุภัณฑ์ชิ้นนี้ไม่พร้อมให้ยืม", "error");
  }

  await prisma.equipmentBorrow.create({
    data: {
      equipment_id: parsed.data.equipment_id,
      borrower_name: parsed.data.borrower_name,
      borrower_contact: parsed.data.borrower_contact || null,
      borrow_date: new Date(parsed.data.borrow_date),
      due_date: parsed.data.due_date ? new Date(parsed.data.due_date) : null,
      note: parsed.data.note || null,
    },
  });
  await prisma.equipment.update({ where: { id: parsed.data.equipment_id }, data: { status: "borrowed" } });
  await logStatusChange(parsed.data.equipment_id, item.status, "borrowed", `ยืมโดย ${parsed.data.borrower_name}`);

  redirectWithFlash("/admin/equipment-borrow", "บันทึกรายการยืมเรียบร้อยแล้ว");
}

const updateSchema = z.object({
  borrower_name: z.string().min(1, "กรุณากรอกชื่อผู้ยืม").max(150),
  borrower_contact: z.string().optional(),
  due_date: z.string().optional(),
  note: z.string().optional(),
});

export async function updateBorrow(id: number, _prev: BorrowFormState, formData: FormData): Promise<BorrowFormState> {
  await requireActionAccess("equipmentborrow");
  const parsed = updateSchema.safeParse({
    borrower_name: formData.get("borrower_name"),
    borrower_contact: formData.get("borrower_contact") || undefined,
    due_date: formData.get("due_date") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
    return { ok: false, errors };
  }

  await prisma.equipmentBorrow.update({
    where: { id },
    data: {
      borrower_name: parsed.data.borrower_name,
      borrower_contact: parsed.data.borrower_contact || null,
      due_date: parsed.data.due_date ? new Date(parsed.data.due_date) : null,
      note: parsed.data.note || null,
    },
  });

  redirectWithFlash("/admin/equipment-borrow", "บันทึกการแก้ไขเรียบร้อยแล้ว");
}

export async function approveBorrowRequest(formData: FormData): Promise<void> {
  const user = await requireActionAccess("equipmentborrow");
  const id = Number(formData.get("id"));
  const loan = await prisma.equipmentBorrow.findUnique({ where: { id }, include: { equipment: true } });

  if (!loan || loan.request_status !== "pending") {
    redirectWithFlash("/admin/equipment-borrow", "ไม่พบคำร้อง หรือดำเนินการไปแล้ว", "error");
  }
  if (loan.equipment.status !== "available") {
    redirectWithFlash("/admin/equipment-borrow", "ครุภัณฑ์ชิ้นนี้ไม่พร้อมให้ยืมแล้ว ไม่สามารถอนุมัติได้", "error");
  }

  const now = new Date();
  const decidedBy = user.name ?? user.id;
  // One transaction: the conditional claim keeps two concurrent approvals for
  // the same item from both succeeding, and a failure partway rolls back.
  const approved = await prisma.$transaction(async (tx) => {
    const claimed = await tx.equipment.updateMany({
      where: { id: loan.equipment_id, status: "available" },
      data: { status: "borrowed" },
    });
    if (claimed.count === 0) return false;

    const decided = await tx.equipmentBorrow.updateMany({
      where: { id, request_status: "pending" },
      data: { request_status: "approved", borrow_date: now, decided_at: now, decided_by: decidedBy },
    });
    if (decided.count === 0) throw new Error("request already decided");

    // Competing requests for the same item can no longer be fulfilled.
    await tx.equipmentBorrow.updateMany({
      where: { equipment_id: loan.equipment_id, request_status: "pending", id: { not: id } },
      data: { request_status: "rejected", decided_at: now, decided_by: decidedBy, reject_reason: "ครุภัณฑ์ถูกยืมโดยผู้อื่นแล้ว" },
    });
    return true;
  });
  if (!approved) {
    redirectWithFlash("/admin/equipment-borrow", "ครุภัณฑ์ชิ้นนี้ไม่พร้อมให้ยืมแล้ว ไม่สามารถอนุมัติได้", "error");
  }
  await logStatusChange(loan.equipment_id, "available", "borrowed", `อนุมัติคำร้องยืมของ ${loan.borrower_name}`);

  redirectWithFlash("/admin/equipment-borrow", "อนุมัติคำร้องเรียบร้อยแล้ว");
}

export async function rejectBorrowRequest(formData: FormData): Promise<void> {
  const user = await requireActionAccess("equipmentborrow");
  const id = Number(formData.get("id"));
  const reason = String(formData.get("reject_reason") ?? "").trim().slice(0, 255);

  const result = await prisma.equipmentBorrow.updateMany({
    where: { id, request_status: "pending" },
    data: { request_status: "rejected", decided_at: new Date(), decided_by: user.name ?? user.id, reject_reason: reason || null },
  });
  if (result.count === 0) {
    redirectWithFlash("/admin/equipment-borrow", "ไม่พบคำร้อง หรือดำเนินการไปแล้ว", "error");
  }

  redirectWithFlash("/admin/equipment-borrow", "ปฏิเสธคำร้องเรียบร้อยแล้ว");
}

export async function returnBorrow(formData: FormData): Promise<void> {
  await requireActionAccess("equipmentborrow");
  const id = Number(formData.get("id"));
  const loan = await prisma.equipmentBorrow.findUniqueOrThrow({ where: { id } });

  if (loan.return_date !== null || loan.request_status !== "approved") {
    redirectWithFlash("/admin/equipment-borrow", "ไม่พบรายการยืม หรือคืนแล้ว", "error");
  }

  const condition = formData.get("return_condition") === "damaged" ? "damaged" : "normal";
  const detail = String(formData.get("return_note") ?? "").trim();
  const newStatus = condition === "damaged" ? "damaged" : "available";
  await prisma.equipmentBorrow.update({ where: { id }, data: { return_date: new Date(), return_condition: condition } });
  await prisma.equipment.update({ where: { id: loan.equipment_id }, data: { status: newStatus } });
  await logStatusChange(loan.equipment_id, "borrowed", newStatus, `รับคืนจาก ${loan.borrower_name}${detail ? ` — ${detail}` : ""}`);

  redirectWithFlash("/admin/equipment-borrow", "รับคืนครุภัณฑ์เรียบร้อยแล้ว");
}

export async function deleteBorrow(formData: FormData): Promise<void> {
  await requireActionAccess("equipmentborrow");
  const id = Number(formData.get("id"));
  const loan = await prisma.equipmentBorrow.findUniqueOrThrow({ where: { id } });

  // Only an approved, unreturned loan ever flipped the equipment to borrowed.
  if (loan.return_date === null && loan.request_status === "approved") {
    await prisma.equipment.update({ where: { id: loan.equipment_id }, data: { status: "available" } });
    await logStatusChange(loan.equipment_id, "borrowed", "available", "ลบรายการยืม");
  }
  await prisma.equipmentBorrow.delete({ where: { id } });

  redirectWithFlash("/admin/equipment-borrow", "ลบรายการยืมเรียบร้อยแล้ว");
}

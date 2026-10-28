"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, HandHelping, Send } from "lucide-react";
import { submitBorrowRequest, type BorrowRequestState } from "./actions";

const initialState: BorrowRequestState = { ok: false };
const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none";

export function BorrowRequestForm({ equipmentId }: { equipmentId: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(submitBorrowRequest.bind(null, equipmentId), initialState);

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-primary-100 bg-primary-50 p-6 text-center">
        <CheckCircle2 className="text-primary-600" size={32} />
        <p className="font-bold text-primary-700">ส่งคำร้องขอยืมเรียบร้อยแล้ว</p>
        <p className="text-sm text-text-muted">
          เจ้าหน้าที่จะตรวจสอบและติดต่อกลับตามเบอร์โทรที่ระบุ
          <br />
          เมื่อใช้งานเสร็จแล้ว กรุณานำครุภัณฑ์มาคืนที่เจ้าหน้าที่โดยตรง
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600"
      >
        <HandHelping size={16} /> ขอยืมครุภัณฑ์ชิ้นนี้
      </button>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <h2 className="text-base font-bold text-text">แบบคำร้องขอยืมครุภัณฑ์</h2>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <div>
        <label htmlFor="borrower_name" className="mb-1 block text-sm font-medium text-text">ชื่อ-นามสกุล *</label>
        <input id="borrower_name" name="borrower_name" className={inputClass} />
        {state.errors?.borrower_name && <p className="mt-1 text-xs text-danger">{state.errors.borrower_name}</p>}
      </div>
      <div>
        <label htmlFor="borrower_contact" className="mb-1 block text-sm font-medium text-text">เบอร์โทรศัพท์ติดต่อ *</label>
        <input id="borrower_contact" name="borrower_contact" type="tel" className={inputClass} />
        {state.errors?.borrower_contact && <p className="mt-1 text-xs text-danger">{state.errors.borrower_contact}</p>}
      </div>
      <div>
        <label htmlFor="due_date" className="mb-1 block text-sm font-medium text-text">วันที่คาดว่าจะคืน</label>
        <input id="due_date" name="due_date" type="date" className={inputClass} />
        {state.errors?.due_date && <p className="mt-1 text-xs text-danger">{state.errors.due_date}</p>}
      </div>
      <div>
        <label htmlFor="note" className="mb-1 block text-sm font-medium text-text">วัตถุประสงค์การยืม</label>
        <textarea id="note" name="note" rows={3} maxLength={1000} className={inputClass} />
      </div>

      {state.error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>}

      <p className="text-xs text-text-muted">
        คำร้องนี้ต้องได้รับการอนุมัติจากเจ้าหน้าที่ก่อน และการคืนต้องนำครุภัณฑ์มาคืนที่เจ้าหน้าที่โดยตรงเท่านั้น
      </p>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
        >
          <Send size={14} /> {isPending ? "กำลังส่ง..." : "ส่งคำร้อง"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full px-5 py-2.5 text-sm text-text-muted hover:text-text">
          ยกเลิก
        </button>
      </div>
    </form>
  );
}

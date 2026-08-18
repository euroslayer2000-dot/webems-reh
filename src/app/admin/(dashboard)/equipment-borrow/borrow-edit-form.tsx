"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { updateBorrow, type BorrowFormState } from "./actions";

type BorrowRecord = {
  id: number;
  borrower_name: string;
  borrower_contact: string | null;
  due_date: Date | null;
  note: string | null;
  equipment: { code: string; name: string };
  borrow_count: number;
};

const initialState: BorrowFormState = { ok: false };

export function BorrowEditForm({ loan }: { loan: BorrowRecord }) {
  const action = updateBorrow.bind(null, loan.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <div className="rounded-[10px] bg-surface-2 px-3.5 py-2.5 text-sm text-text-muted">
            ครุภัณฑ์: {loan.equipment.code} — {loan.equipment.name}
            <br />
            <span className="text-xs">
              ไม่สามารถเปลี่ยนครุภัณฑ์ของรายการยืมที่มีอยู่แล้วได้ • เคยถูกยืมมาแล้ว <strong>{loan.borrow_count}</strong> ครั้ง
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="ชื่อผู้ยืม" htmlFor="borrower_name" required error={state.errors?.borrower_name}>
              <input id="borrower_name" name="borrower_name" defaultValue={loan.borrower_name} className={inputClass} />
            </FormField>
            <FormField label="ช่องทางติดต่อ" htmlFor="borrower_contact">
              <input id="borrower_contact" name="borrower_contact" defaultValue={loan.borrower_contact ?? ""} className={inputClass} />
            </FormField>
          </div>

          <FormField label="กำหนดคืน" htmlFor="due_date">
            <input
              id="due_date"
              name="due_date"
              type="date"
              defaultValue={loan.due_date ? new Date(loan.due_date).toISOString().slice(0, 10) : ""}
              className={inputClass}
            />
          </FormField>

          <FormField label="หมายเหตุ" htmlFor="note">
            <textarea id="note" name="note" rows={3} defaultValue={loan.note ?? ""} className={inputClass} />
          </FormField>

          <FormActions isPending={isPending} cancelHref="/admin/equipment-borrow" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

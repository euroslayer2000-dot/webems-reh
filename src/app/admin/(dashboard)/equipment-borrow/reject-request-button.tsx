"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { inputClass } from "@/components/admin/form-field";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { rejectBorrowRequest } from "./actions";

export function RejectRequestButton({ loanId, equipmentName }: { loanId: number; equipmentName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${btnDangerSm} shrink-0 whitespace-nowrap`}>
        ปฏิเสธ
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-[var(--radius-lg)] bg-surface p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-text">ปฏิเสธคำร้องยืม &quot;{equipmentName}&quot;</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="ปิด" className="text-text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>

            <form action={rejectBorrowRequest} className="grid gap-4">
              <input type="hidden" name="id" value={loanId} />
              <div>
                <label htmlFor={`reject_reason_${loanId}`} className="mb-1.5 block text-sm font-semibold text-text">
                  เหตุผล (ถ้ามี)
                </label>
                <textarea id={`reject_reason_${loanId}`} name="reject_reason" rows={3} maxLength={255} className={inputClass} />
              </div>
              <div className="mt-1 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className={btnGhostSm}>
                  ยกเลิก
                </button>
                <button type="submit" className={btnPrimary}>
                  ยืนยันปฏิเสธ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

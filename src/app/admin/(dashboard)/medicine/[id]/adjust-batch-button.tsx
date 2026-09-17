"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { inputClass } from "@/components/admin/form-field";
import { btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { adjustBatch } from "./actions";

export function AdjustBatchButton({ batchId, medicineId, lotNo, currentQty }: { batchId: number; medicineId: number; lotNo: string; currentQty: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnGhostSm}>
        ปรับยอด
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-[var(--radius-lg)] bg-surface p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-text">ปรับยอดล็อต &quot;{lotNo}&quot;</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="ปิด" className="text-text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>

            <form action={adjustBatch} className="grid gap-4">
              <input type="hidden" name="id" value={batchId} />
              <input type="hidden" name="medicine_id" value={medicineId} />

              <div>
                <label htmlFor="new_quantity" className="mb-1.5 block text-sm font-semibold text-text">
                  จำนวนคงเหลือที่ถูกต้อง (ปัจจุบัน {currentQty})
                </label>
                <input id="new_quantity" name="new_quantity" type="number" min="0" defaultValue={currentQty} required className={inputClass} />
              </div>

              <div>
                <label htmlFor="note" className="mb-1.5 block text-sm font-semibold text-text">
                  เหตุผลในการปรับยอด <span className="text-danger">*</span>
                </label>
                <textarea id="note" name="note" rows={2} required placeholder="เช่น นับสต๊อกจริงแล้วไม่ตรง, แก้ไขข้อมูลที่กรอกผิด" className={inputClass} />
              </div>

              <div className="mt-1 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className={btnGhostSm}>
                  ยกเลิก
                </button>
                <button type="submit" className={btnPrimary}>
                  บันทึกการปรับยอด
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

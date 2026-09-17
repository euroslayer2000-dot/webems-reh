"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { inputClass } from "@/components/admin/form-field";
import { btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { returnBorrow } from "./actions";

export function ReturnBorrowButton({ loanId, equipmentName }: { loanId: number; equipmentName: string }) {
  const [open, setOpen] = useState(false);
  const [condition, setCondition] = useState<"normal" | "damaged">("normal");

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setCondition("normal");
          setOpen(true);
        }}
        className={`${btnGhostSm} min-w-13.75 shrink-0 whitespace-nowrap text-center`}
      >
        รับคืน
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-[var(--radius-lg)] bg-surface p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-text">รับคืนครุภัณฑ์ &quot;{equipmentName}&quot;</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="ปิด" className="text-text-muted hover:text-text">
                <X size={18} />
              </button>
            </div>

            <form action={returnBorrow} className="grid gap-4">
              <input type="hidden" name="id" value={loanId} />

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-text">สภาพเมื่อรับคืน</label>
                <div className="flex items-center gap-4 text-sm text-text">
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="return_condition"
                      value="normal"
                      checked={condition === "normal"}
                      onChange={() => setCondition("normal")}
                      className="h-4 w-4 border-border text-primary-600 focus:ring-primary-500"
                    />
                    ปกติ
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="return_condition"
                      value="damaged"
                      checked={condition === "damaged"}
                      onChange={() => setCondition("damaged")}
                      className="h-4 w-4 border-border text-primary-600 focus:ring-primary-500"
                    />
                    ชำรุด/เสียหาย
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="return_note" className="mb-1.5 block text-sm font-semibold text-text">
                  รายละเอียดความชำรุด/เสียหาย {condition === "damaged" && <span className="text-danger">*</span>}
                </label>
                <textarea
                  id="return_note"
                  name="return_note"
                  rows={3}
                  required={condition === "damaged"}
                  placeholder="ระบุจุดที่ชำรุดหรือเสียหาย (ถ้ามี)"
                  className={inputClass}
                />
              </div>

              <div className="mt-1 flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className={btnGhostSm}>
                  ยกเลิก
                </button>
                <button type="submit" className={btnPrimary}>
                  ยืนยันรับคืน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { btnPrimary } from "@/components/admin/button-styles";
import { createStockTake, type StockTakeFormState } from "./actions";

const initialState: StockTakeFormState = { ok: false };

export function StockTakeCreateForm() {
  const [state, formAction, isPending] = useActionState(createStockTake, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[240px] flex-1">
        <FormField label="ชื่อรอบตรวจนับ" htmlFor="title" error={state.errors?.title}>
          <input id="title" name="title" placeholder="เช่น ตรวจนับประจำปี 2569" className={inputClass} />
        </FormField>
      </div>
      <button type="submit" disabled={isPending} className={btnPrimary}>
        {isPending ? "กำลังเริ่ม..." : "เริ่มรอบตรวจนับใหม่"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { btnPrimary } from "@/components/admin/button-styles";
import { createBatch, type BatchFormState } from "./actions";

const initialState: BatchFormState = { ok: false };

export function BatchCreateForm({ medicineId }: { medicineId: number }) {
  const [state, formAction, isPending] = useActionState(createBatch, initialState);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="medicine_id" value={medicineId} />
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="เลขล็อต" htmlFor="lot_no" required error={state.errors?.lot_no}>
          <input id="lot_no" name="lot_no" className={inputClass} />
        </FormField>
        <FormField label="วันหมดอายุ" htmlFor="expiry_date" required error={state.errors?.expiry_date}>
          <input id="expiry_date" name="expiry_date" type="date" className={inputClass} />
        </FormField>
        <FormField label="จำนวนที่รับเข้า" htmlFor="quantity" required error={state.errors?.quantity}>
          <input id="quantity" name="quantity" type="number" min="1" className={inputClass} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <FormField label="สถานที่จัดเก็บ" htmlFor="location">
          <input id="location" name="location" className={inputClass} />
        </FormField>
        <FormField label="ผู้จำหน่าย" htmlFor="supplier">
          <input id="supplier" name="supplier" className={inputClass} />
        </FormField>
        <FormField label="ราคาต่อหน่วย (บาท)" htmlFor="purchase_price">
          <input id="purchase_price" name="purchase_price" type="number" step="0.01" min="0" className={inputClass} />
        </FormField>
        <FormField label="วันที่รับเข้า" htmlFor="received_date">
          <input id="received_date" name="received_date" type="date" className={inputClass} />
        </FormField>
      </div>
      <div>
        <button type="submit" disabled={isPending} className={`${btnPrimary} disabled:opacity-60`}>
          {isPending ? "กำลังบันทึก..." : "รับยาเข้าล็อตใหม่"}
        </button>
      </div>
    </form>
  );
}

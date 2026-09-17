"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { btnPrimary } from "@/components/admin/button-styles";
import { createChecklist, type ChecklistFormState } from "./actions";

const initialState: ChecklistFormState = { ok: false };

export function ChecklistCreateForm() {
  const [state, formAction, isPending] = useActionState(createChecklist, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[240px] flex-1">
        <FormField label="ชื่อรอบตรวจเช็คสต๊อกยา" htmlFor="title" error={state.errors?.title}>
          <input id="title" name="title" placeholder="เช่น ตรวจเช็คยาประจำรถ ก.ค. 2569" className={inputClass} />
        </FormField>
      </div>
      <button type="submit" disabled={isPending} className={btnPrimary}>
        {isPending ? "กำลังเริ่ม..." : "เริ่มรอบตรวจเช็คใหม่"}
      </button>
    </form>
  );
}

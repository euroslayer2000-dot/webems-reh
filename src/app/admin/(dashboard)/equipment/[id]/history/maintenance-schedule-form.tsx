"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { btnPrimary } from "@/components/admin/button-styles";
import type { ScheduleFormState } from "./actions";

const initialState: ScheduleFormState = { ok: false };

export function MaintenanceScheduleForm({
  equipmentId,
  action,
}: {
  equipmentId: number;
  action: (prev: ScheduleFormState, formData: FormData) => Promise<ScheduleFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="equipment_id" value={equipmentId} />
      <div className="min-w-[220px] flex-1">
        <FormField label="รายการบำรุงรักษา/สอบเทียบ" htmlFor="title" error={state.errors?.title}>
          <input id="title" name="title" placeholder="เช่น สอบเทียบเครื่องวัดความดัน" className={inputClass} />
        </FormField>
      </div>
      <div className="w-44">
        <FormField label="วันครบกำหนด" htmlFor="scheduled_date" error={state.errors?.scheduled_date}>
          <input id="scheduled_date" name="scheduled_date" type="date" className={inputClass} />
        </FormField>
      </div>
      <div className="min-w-[180px] flex-1">
        <FormField label="หมายเหตุ" htmlFor="note">
          <input id="note" name="note" className={inputClass} />
        </FormField>
      </div>
      <button type="submit" disabled={isPending} className={btnPrimary}>
        {isPending ? "กำลังบันทึก..." : "เพิ่มกำหนดการ"}
      </button>
    </form>
  );
}

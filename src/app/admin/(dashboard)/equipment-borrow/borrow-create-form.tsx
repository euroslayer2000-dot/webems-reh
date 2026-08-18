"use client";

import { useState, type ChangeEvent } from "react";
import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { EQUIPMENT_STATUS_META } from "@/lib/equipment-status";
import { createBorrow, type BorrowFormState } from "./actions";

type EquipmentOption = {
  id: number;
  code: string;
  name: string;
  status: keyof typeof EQUIPMENT_STATUS_META;
  brand: string | null;
  unit: string;
  location: string | null;
  borrow_count: number;
  category: { name: string } | null;
};

const initialState: BorrowFormState = { ok: false };

export function BorrowCreateForm({ equipments }: { equipments: EquipmentOption[] }) {
  const [state, formAction, isPending] = useActionState(createBorrow, initialState);
  const today = new Date().toISOString().slice(0, 16);
  const [selected, setSelected] = useState<EquipmentOption | null>(null);

  function handleEquipmentChange(e: ChangeEvent<HTMLSelectElement>) {
    const id = Number(e.target.value);
    setSelected(equipments.find((eq) => eq.id === id) ?? null);
  }

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <FormField label="ครุภัณฑ์" htmlFor="equipment_id" required error={state.errors?.equipment_id}>
            <select id="equipment_id" name="equipment_id" className={inputClass} onChange={handleEquipmentChange}>
              <option value="">เลือกครุภัณฑ์</option>
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.code} — {eq.name} {eq.category ? `(${eq.category.name})` : ""}
                </option>
              ))}
            </select>
            {equipments.length === 0 && <p className="mt-1 text-xs text-danger">ไม่มีครุภัณฑ์ที่พร้อมให้ยืมในขณะนี้</p>}
          </FormField>

          {selected && (
            <div className="rounded-[10px] border border-border bg-bg-soft p-3.5 text-sm">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text">
                  {selected.category?.name ?? "ไม่ระบุหมวดหมู่"}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${EQUIPMENT_STATUS_META[selected.status].className}`}>
                  {EQUIPMENT_STATUS_META[selected.status].label}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                <div><span className="text-text-muted">ยี่ห้อ:</span> {selected.brand ?? "-"}</div>
                <div><span className="text-text-muted">หน่วยนับ:</span> {selected.unit ?? "-"}</div>
                <div><span className="text-text-muted">สถานที่จัดเก็บ:</span> {selected.location ?? "-"}</div>
                <div><span className="text-text-muted">ประวัติการยืม:</span> เคยถูกยืมมาแล้ว <strong>{selected.borrow_count}</strong> ครั้ง</div>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="ชื่อผู้ยืม" htmlFor="borrower_name" required error={state.errors?.borrower_name}>
              <input id="borrower_name" name="borrower_name" className={inputClass} />
            </FormField>
            <FormField label="ช่องทางติดต่อ" htmlFor="borrower_contact">
              <input id="borrower_contact" name="borrower_contact" className={inputClass} />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="วันที่ยืม" htmlFor="borrow_date" required error={state.errors?.borrow_date}>
              <input id="borrow_date" name="borrow_date" type="datetime-local" defaultValue={today} className={inputClass} />
            </FormField>
            <FormField label="กำหนดคืน" htmlFor="due_date">
              <input id="due_date" name="due_date" type="date" className={inputClass} />
            </FormField>
          </div>

          <FormField label="หมายเหตุ" htmlFor="note">
            <textarea id="note" name="note" rows={3} className={inputClass} />
          </FormField>

          <FormActions isPending={isPending} cancelHref="/admin/equipment-borrow" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

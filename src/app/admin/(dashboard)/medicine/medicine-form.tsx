"use client";

import { useActionState, useState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { ImageFileField } from "@/components/admin/image-file-field";
import { uploadUrl } from "@/lib/upload";
import { MEDICINE_CLASSIFICATION_META, MEDICINE_STORAGE_META } from "@/lib/medicine-meta";
import { isAutoMedicineCode } from "@/lib/medicine-code";
import { createMedicine, updateMedicine, type MedicineFormState } from "./actions";

type Category = { id: number; name: string };
type MedicineRecord = {
  id: number;
  code: string;
  generic_name: string;
  trade_name: string | null;
  dosage_form: string | null;
  strength: string | null;
  unit: string;
  classification: string;
  storage_condition: string;
  min_stock: number;
  category_id: number | null;
  description: string | null;
  is_active: boolean;
  photo: string | null;
};

const initialState: MedicineFormState = { ok: false };

export function MedicineForm({ categories, item }: { categories: Category[]; item: MedicineRecord | null }) {
  const action = item ? updateMedicine.bind(null, item.id) : createMedicine;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const itemHasAutoCode = item ? isAutoMedicineCode(item.code) : false;
  const [hasCode, setHasCode] = useState(!itemHasAutoCode);
  const [codeValue, setCodeValue] = useState(itemHasAutoCode ? "" : item?.code ?? "");

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="รหัสยา" htmlFor="code" required={hasCode} error={state.errors?.code}>
              <div className="flex items-center gap-3">
                <div className="flex shrink-0 items-center gap-3 text-sm text-text">
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="code_mode"
                      value="manual"
                      checked={hasCode}
                      onChange={() => setHasCode(true)}
                      className="h-4 w-4 border-border text-primary-600 focus:ring-primary-500"
                    />
                    มีรหัส
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="code_mode"
                      value="auto"
                      checked={!hasCode}
                      onChange={() => setHasCode(false)}
                      className="h-4 w-4 border-border text-primary-600 focus:ring-primary-500"
                    />
                    ไม่มีรหัส
                  </label>
                </div>
                <input
                  id="code"
                  name="code"
                  value={hasCode ? codeValue : ""}
                  onChange={(e) => setCodeValue(e.target.value)}
                  disabled={!hasCode}
                  className={`${inputClass} ${!hasCode ? "cursor-not-allowed bg-surface-2 text-text-muted" : ""}`}
                />
              </div>
            </FormField>
            <FormField label="ชื่อสามัญ (Generic name)" htmlFor="generic_name" required error={state.errors?.generic_name}>
              <input id="generic_name" name="generic_name" defaultValue={item?.generic_name} className={inputClass} />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="ชื่อการค้า" htmlFor="trade_name">
              <input id="trade_name" name="trade_name" defaultValue={item?.trade_name ?? ""} className={inputClass} />
            </FormField>
            <FormField label="หมวดหมู่" htmlFor="category_id">
              <select id="category_id" name="category_id" defaultValue={item?.category_id ?? ""} className={inputClass}>
                <option value="">ไม่ระบุ</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label="รูปแบบยา" htmlFor="dosage_form">
              <input id="dosage_form" name="dosage_form" placeholder="เช่น เม็ด, ฉีด, น้ำ" defaultValue={item?.dosage_form ?? ""} className={inputClass} />
            </FormField>
            <FormField label="ความเข้มข้น" htmlFor="strength">
              <input id="strength" name="strength" placeholder="เช่น 500mg" defaultValue={item?.strength ?? ""} className={inputClass} />
            </FormField>
            <FormField label="หน่วยนับ" htmlFor="unit">
              <input id="unit" name="unit" defaultValue={item?.unit ?? "เม็ด"} className={inputClass} />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label="ประเภทการควบคุม" htmlFor="classification" required>
              <select id="classification" name="classification" defaultValue={item?.classification ?? "general"} className={inputClass}>
                {Object.entries(MEDICINE_CLASSIFICATION_META).map(([value, meta]) => (
                  <option key={value} value={value}>{meta.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="เงื่อนไขการเก็บรักษา" htmlFor="storage_condition" required>
              <select id="storage_condition" name="storage_condition" defaultValue={item?.storage_condition ?? "room_temp"} className={inputClass}>
                {Object.entries(MEDICINE_STORAGE_META).map(([value, meta]) => (
                  <option key={value} value={value}>{meta.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="สต๊อกขั้นต่ำ" htmlFor="min_stock">
              <input id="min_stock" name="min_stock" type="number" min="0" defaultValue={item?.min_stock ?? 0} className={inputClass} />
            </FormField>
          </div>

          <FormField label="รายละเอียด" htmlFor="description">
            <textarea id="description" name="description" rows={3} defaultValue={item?.description ?? ""} className={inputClass} />
          </FormField>

          <FormField label="เปิดใช้งาน" htmlFor="is_active">
            <label className="inline-flex items-center gap-2 text-sm text-text">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                value="1"
                defaultChecked={item ? item.is_active : true}
                className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
              />
              แสดงยานี้ในระบบ (ปิดไว้หากเลิกใช้งานแล้วแต่ยังไม่ต้องการลบประวัติ)
            </label>
          </FormField>

          <div className="grid gap-5 sm:grid-cols-3">
            <ImageFileField label="รูปภาพ" id="photo" name="photo" currentImageUrl={item ? uploadUrl(item.photo) : null} />
          </div>

          <FormActions isPending={isPending} cancelHref="/admin/medicine" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

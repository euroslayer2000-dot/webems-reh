"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { ImageFileField } from "@/components/admin/image-file-field";
import { DocumentFileField } from "@/components/admin/document-file-field";
import { uploadUrl } from "@/lib/upload";
import { EQUIPMENT_STATUS_META } from "@/lib/equipment-status";
import { createEquipment, updateEquipment, type EquipmentFormState } from "./actions";

type Category = { id: number; name: string };
type EquipmentRecord = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  location: string | null;
  brand: string | null;
  status: string;
  category_id: number | null;
  purchase_date: Date | null;
  purchase_price: unknown;
  photo: string | null;
  photo2: string | null;
  photo3: string | null;
  warranty_document: string | null;
  receipt_document: string | null;
};

const initialState: EquipmentFormState = { ok: false };

export function EquipmentForm({ categories, item }: { categories: Category[]; item: EquipmentRecord | null }) {
  const action = item ? updateEquipment.bind(null, item.id) : createEquipment;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="เลขครุภัณฑ์" htmlFor="code" required error={state.errors?.code}>
              <input id="code" name="code" defaultValue={item?.code} className={inputClass} />
            </FormField>
            <FormField label="ชื่อครุภัณฑ์" htmlFor="name" required error={state.errors?.name}>
              <input id="name" name="name" defaultValue={item?.name} className={inputClass} />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="หมวดหมู่" htmlFor="category_id">
              <select id="category_id" name="category_id" defaultValue={item?.category_id ?? ""} className={inputClass}>
                <option value="">ไม่ระบุ</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="สถานะ" htmlFor="status" required>
              <select id="status" name="status" defaultValue={item?.status ?? "available"} className={inputClass}>
                {Object.entries(EQUIPMENT_STATUS_META).map(([value, meta]) => (
                  <option key={value} value={value}>{meta.label}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label="ยี่ห้อ" htmlFor="brand">
              <input id="brand" name="brand" defaultValue={item?.brand ?? ""} className={inputClass} />
            </FormField>
            <FormField label="หน่วยนับ" htmlFor="unit">
              <input id="unit" name="unit" defaultValue={item?.unit ?? "ชิ้น"} className={inputClass} />
            </FormField>
            <FormField label="สถานที่จัดเก็บ" htmlFor="location">
              <input id="location" name="location" defaultValue={item?.location ?? ""} className={inputClass} />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="วันที่จัดซื้อ" htmlFor="purchase_date">
              <input
                id="purchase_date"
                name="purchase_date"
                type="date"
                defaultValue={item?.purchase_date ? new Date(item.purchase_date).toISOString().slice(0, 10) : ""}
                className={inputClass}
              />
            </FormField>
            <FormField label="ราคาที่จัดซื้อ (บาท)" htmlFor="purchase_price">
              <input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={item?.purchase_price != null ? String(item.purchase_price) : ""}
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField label="รายละเอียด" htmlFor="description">
            <textarea id="description" name="description" rows={3} defaultValue={item?.description ?? ""} className={inputClass} />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-3">
            <ImageFileField label="รูปภาพหลัก" id="photo" name="photo" currentImageUrl={item ? uploadUrl(item.photo) : null} />
            <ImageFileField label="รูปภาพเพิ่มเติม 1" id="photo2" name="photo2" currentImageUrl={item ? uploadUrl(item.photo2) : null} />
            <ImageFileField label="รูปภาพเพิ่มเติม 2" id="photo3" name="photo3" currentImageUrl={item ? uploadUrl(item.photo3) : null} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <DocumentFileField
              label="ใบรับประกัน"
              id="warranty_document"
              name="warranty_document"
              currentUrl={item?.warranty_document ? uploadUrl(item.warranty_document) : null}
            />
            <DocumentFileField
              label="ใบเสร็จ/ใบสั่งซื้อ"
              id="receipt_document"
              name="receipt_document"
              currentUrl={item?.receipt_document ? uploadUrl(item.receipt_document) : null}
            />
          </div>

          <FormActions isPending={isPending} cancelHref="/admin/equipment" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

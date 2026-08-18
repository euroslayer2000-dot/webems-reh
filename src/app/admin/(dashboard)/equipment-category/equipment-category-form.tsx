"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { createEquipmentCategory, updateEquipmentCategory, type EquipmentCategoryFormState } from "./actions";

type CategoryRecord = { id: number; code: string; name: string; sort_order: number };

const initialState: EquipmentCategoryFormState = { ok: false };

export function EquipmentCategoryForm({ category }: { category: CategoryRecord | null }) {
  const action = category ? updateEquipmentCategory.bind(null, category.id) : createEquipmentCategory;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="รหัสหมวดหมู่" htmlFor="code" required error={state.errors?.code}>
              <input id="code" name="code" defaultValue={category?.code} className={inputClass} />
            </FormField>
            <FormField label="ชื่อหมวดหมู่" htmlFor="name" required error={state.errors?.name}>
              <input id="name" name="name" defaultValue={category?.name} className={inputClass} />
            </FormField>
          </div>

          <FormField label="ลำดับการแสดงผล" htmlFor="sort_order">
            <input id="sort_order" name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} className={inputClass} />
          </FormField>

          <FormActions isPending={isPending} cancelHref="/admin/equipment-category" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

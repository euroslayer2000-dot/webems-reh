"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { ImageFileField } from "@/components/admin/image-file-field";
import { uploadUrl } from "@/lib/upload";
import { createStructure, updateStructure, type StructureFormState } from "./actions";

type StructureRecord = { id: number; title: string | null; sort_order: number; is_active: boolean; image: string };

const initialState: StructureFormState = { ok: false };

export function StructureForm({ structure }: { structure: StructureRecord | null }) {
  const action = structure ? updateStructure.bind(null, structure.id) : createStructure;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <FormField label="ชื่อ/คำอธิบาย" htmlFor="title">
            <input id="title" name="title" defaultValue={structure?.title ?? ""} className={inputClass} />
          </FormField>

          <label className="flex w-fit items-center gap-2 text-sm text-text">
            <input type="checkbox" name="is_active" defaultChecked={structure?.is_active ?? true} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
            เผยแพร่บนเว็บไซต์
          </label>

          <ImageFileField
            label="รูปภาพ"
            id="image"
            name="image"
            required={!structure}
            error={state.errors?.image}
            currentImageUrl={structure ? uploadUrl(structure.image) : null}
          />

          <FormActions isPending={isPending} cancelHref="/admin/structure" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

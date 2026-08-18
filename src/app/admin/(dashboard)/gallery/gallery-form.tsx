"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { ImageFileField } from "@/components/admin/image-file-field";
import { uploadUrl } from "@/lib/upload";
import { createGallery, updateGallery, type GalleryFormState } from "./actions";

type GalleryRecord = { id: number; title: string; slug: string; description: string | null; cover_image: string | null };

const initialState: GalleryFormState = { ok: false };

export function GalleryForm({ gallery }: { gallery: GalleryRecord | null }) {
  const action = gallery ? updateGallery.bind(null, gallery.id) : createGallery;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <FormField label="ชื่ออัลบั้ม" htmlFor="title" required error={state.errors?.title}>
            <input id="title" name="title" defaultValue={gallery?.title} className={inputClass} />
          </FormField>

          <FormField label="สลัก (slug)" htmlFor="slug">
            <input id="slug" name="slug" defaultValue={gallery?.slug} placeholder="เว้นว่างเพื่อสร้างอัตโนมัติ" className={inputClass} />
          </FormField>

          <FormField label="คำอธิบาย" htmlFor="description">
            <textarea id="description" name="description" rows={3} defaultValue={gallery?.description ?? ""} className={inputClass} />
          </FormField>

          <ImageFileField
            label="ภาพหน้าปก"
            id="cover_image"
            name="cover_image"
            currentImageUrl={gallery ? uploadUrl(gallery.cover_image) : null}
          />

          <FormActions isPending={isPending} cancelHref="/admin/gallery" label="บันทึกอัลบั้ม" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

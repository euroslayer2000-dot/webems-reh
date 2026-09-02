"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { ImageFileField } from "@/components/admin/image-file-field";
import { uploadUrl } from "@/lib/upload";
import { updateBanner, type BannerFormState } from "./actions";

type BannerRecord = {
  id: number;
  title: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  image: string;
};

const initialState: BannerFormState = { ok: false };

export function BannerForm({ banner }: { banner: BannerRecord }) {
  const action = updateBanner.bind(null, banner.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <FormField label="รายละเอียดรูปภาพ" htmlFor="title">
            <input id="title" name="title" defaultValue={banner.title ?? ""} className={inputClass} placeholder="เช่น รูปทีมกู้ชีพปฏิบัติการ" />
            <p className="mt-1 text-xs text-text-muted">ใส่ไว้เพื่อให้ทราบว่ารูปนี้คือรูปอะไร จะได้แก้ไขได้ง่ายภายหลัง</p>
          </FormField>

          <FormField label="ลิงก์ปลายทาง (ถ้ามี)" htmlFor="link_url">
            <input id="link_url" name="link_url" defaultValue={banner.link_url ?? ""} className={inputClass} />
          </FormField>

          <label className="flex w-fit items-center gap-2 text-sm text-text">
            <input type="checkbox" name="is_active" defaultChecked={banner.is_active} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
            เผยแพร่บนเว็บไซต์
          </label>

          <ImageFileField
            label="รูปภาพ"
            id="image"
            name="image"
            error={state.errors?.image}
            currentImageUrl={uploadUrl(banner.image)}
          />

          <FormActions isPending={isPending} cancelHref="/admin/banner" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

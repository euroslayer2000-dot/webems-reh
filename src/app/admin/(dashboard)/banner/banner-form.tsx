"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { ImageFileField } from "@/components/admin/image-file-field";
import { uploadUrl } from "@/lib/upload";
import { createBanner, updateBanner, type BannerFormState } from "./actions";

type BannerRecord = {
  id: number;
  title: string | null;
  link_url: string | null;
  position: string;
  sort_order: number;
  is_active: boolean;
  image: string;
};

const initialState: BannerFormState = { ok: false };

export function BannerForm({ banner }: { banner: BannerRecord | null }) {
  const action = banner ? updateBanner.bind(null, banner.id) : createBanner;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <FormField label="ชื่อแบนเนอร์" htmlFor="title">
            <input id="title" name="title" defaultValue={banner?.title ?? ""} className={inputClass} />
          </FormField>

          <FormField label="ลิงก์ปลายทาง" htmlFor="link_url">
            <input id="link_url" name="link_url" defaultValue={banner?.link_url ?? ""} className={inputClass} />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="ตำแหน่ง" htmlFor="position">
              <select id="position" name="position" defaultValue={banner?.position ?? "hero"} className={inputClass}>
                <option value="hero">Hero (หน้าแรก)</option>
                <option value="sidebar">Sidebar</option>
                <option value="popup">Popup</option>
              </select>
            </FormField>
            <FormField label="ลำดับการแสดงผล" htmlFor="sort_order">
              <input id="sort_order" name="sort_order" type="number" defaultValue={banner?.sort_order ?? 0} className={inputClass} />
            </FormField>
          </div>

          <label className="flex w-fit items-center gap-2 text-sm text-text">
            <input type="checkbox" name="is_active" defaultChecked={banner?.is_active ?? true} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
            เผยแพร่บนเว็บไซต์
          </label>

          <ImageFileField
            label="รูปภาพ"
            id="image"
            name="image"
            required={!banner}
            error={state.errors?.image}
            currentImageUrl={banner ? uploadUrl(banner.image) : null}
          />

          <FormActions isPending={isPending} cancelHref="/admin/banner" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

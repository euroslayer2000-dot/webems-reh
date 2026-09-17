"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { ImageFileField } from "@/components/admin/image-file-field";
import { uploadUrl } from "@/lib/upload";
import { createPopupBanner, updateBanner, type BannerFormState } from "./actions";

type BannerRecord = {
  id: number;
  title: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  image: string;
  position: "hero" | "sidebar" | "popup";
};

const initialState: BannerFormState = { ok: false };

/** `banner: null` renders a create form (currently only used for popup
 * banners — hero banners are still added via the single-click quick-add
 * button, which needs no review step since it's just one more carousel slide). */
export function BannerForm({ banner, backHref = "/admin/banner" }: { banner: BannerRecord | null; backHref?: string }) {
  const action = banner ? updateBanner.bind(null, banner.id) : createPopupBanner;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isPopup = banner ? banner.position === "popup" : true;

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <FormField label={isPopup ? "ข้อความ (ถ้ามี)" : "รายละเอียดรูปภาพ"} htmlFor="title">
            <input
              id="title"
              name="title"
              defaultValue={banner?.title ?? ""}
              className={inputClass}
              placeholder={isPopup ? "เช่น ประกาศปิดปรับปรุงระบบ 1-3 ต.ค." : "เช่น รูปทีมกู้ชีพปฏิบัติการ"}
            />
            <p className="mt-1 text-xs text-text-muted">
              {isPopup ? "จะแสดงเป็นข้อความใต้รูปภาพในป๊อปอัพ เว้นว่างได้หากไม่ต้องการ" : "ใส่ไว้เพื่อให้ทราบว่ารูปนี้คือรูปอะไร จะได้แก้ไขได้ง่ายภายหลัง"}
            </p>
          </FormField>

          <FormField label="ลิงก์ปลายทาง (ถ้ามี)" htmlFor="link_url">
            <input id="link_url" name="link_url" defaultValue={banner?.link_url ?? ""} className={inputClass} />
          </FormField>

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
            previewVariant={isPopup ? "wide" : "thumb"}
          />

          <FormActions isPending={isPending} cancelHref={backHref} />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

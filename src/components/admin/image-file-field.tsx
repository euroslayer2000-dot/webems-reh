"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { MAX_UPLOAD_SIZE_MB } from "@/lib/upload";
import { FormField, inputClass } from "./form-field";

export function ImageFileField({
  label,
  id,
  name,
  required,
  error,
  currentImageUrl,
  accept = "image/*",
  previewVariant = "thumb",
}: {
  label: string;
  id: string;
  name: string;
  required?: boolean;
  error?: string;
  currentImageUrl?: string | null;
  accept?: string;
  /** "thumb" (default): small cropped square, used everywhere. "wide": a
   * large preview that shows the full image at its own aspect ratio (no
   * cropping), mirroring how PopupBannerModal sizes the frame to the
   * picture on the public site — use this where admins need to see the
   * whole image before saving. */
  previewVariant?: "thumb" | "wide";
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file && file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      setSizeError(
        `ไฟล์รูปภาพขนาด ${(file.size / 1024 / 1024).toFixed(1)}MB ใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน ${MAX_UPLOAD_SIZE_MB}MB (ลองบีบอัดหรือลดขนาดรูปก่อนอัปโหลด)`
      );
      e.target.value = "";
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    setSizeError(null);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  const displaySrc = preview ?? currentImageUrl ?? null;

  if (previewVariant === "wide") {
    return (
      <FormField label={label} htmlFor={id} required={required} error={sizeError ?? error}>
        <input id={id} name={name} type="file" accept={accept} onChange={handleChange} className={inputClass} />
        {displaySrc && (
          <div className="mt-3">
            <div className="inline-block max-w-full overflow-hidden rounded-lg border border-border bg-bg-soft p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- object URL preview, next/image can't optimize it */}
              <img src={displaySrc} alt="ตัวอย่างรูปภาพ" className="block h-auto max-h-[420px] w-auto max-w-full" />
            </div>
            <p className="mt-1.5 text-xs text-text-muted">
              ตัวอย่างรูปเต็ม ไม่มีการครอบตัด — กรอบป๊อปอัพบนหน้าเว็บจะปรับขนาดตามสัดส่วนจริงของรูปนี้โดยอัตโนมัติ (กว้างสูงสุด 1700px)
              {preview && !sizeError && " (ยังไม่ได้บันทึก ตรวจสอบให้ถูกต้องก่อนกดบันทึก)"}
            </p>
          </div>
        )}
      </FormField>
    );
  }

  return (
    <FormField label={label} htmlFor={id} required={required} error={sizeError ?? error}>
      <div className="flex items-center gap-4">
        {displaySrc && (
          // eslint-disable-next-line @next/next/no-img-element -- object URL preview, next/image can't optimize it
          <img
            src={displaySrc}
            alt="ตัวอย่างรูปภาพ"
            className="h-20 w-20 shrink-0 rounded-lg border border-border bg-bg-soft object-cover"
          />
        )}
        <input id={id} name={name} type="file" accept={accept} onChange={handleChange} className={`${inputClass} flex-1`} />
      </div>
      {preview && !sizeError && <p className="mt-1.5 text-xs text-text-muted">รูปตัวอย่างที่จะอัปโหลด — ตรวจสอบให้ถูกต้องก่อนบันทึก</p>}
    </FormField>
  );
}

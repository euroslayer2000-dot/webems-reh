"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { FormField, inputClass } from "./form-field";

export function ImageFileField({
  label,
  id,
  name,
  required,
  error,
  currentImageUrl,
  accept = "image/*",
}: {
  label: string;
  id: string;
  name: string;
  required?: boolean;
  error?: string;
  currentImageUrl?: string | null;
  accept?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  const displaySrc = preview ?? currentImageUrl ?? null;

  return (
    <FormField label={label} htmlFor={id} required={required} error={error}>
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
      {preview && <p className="mt-1.5 text-xs text-text-muted">รูปตัวอย่างที่จะอัปโหลด — ตรวจสอบให้ถูกต้องก่อนบันทึก</p>}
    </FormField>
  );
}

"use client";

import { useState, type ChangeEvent } from "react";
import { FileText } from "lucide-react";
import { MAX_UPLOAD_SIZE_MB } from "@/lib/upload";
import { FormField, inputClass } from "./form-field";

export function DocumentFileField({
  label,
  id,
  name,
  currentUrl,
  accept = ".pdf,image/*",
  required,
  error,
}: {
  label: string;
  id: string;
  name: string;
  currentUrl?: string | null;
  accept?: string;
  required?: boolean;
  error?: string;
}) {
  const [sizeError, setSizeError] = useState<string | null>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      setSizeError(
        `ไฟล์ขนาด ${(file.size / 1024 / 1024).toFixed(1)}MB ใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน ${MAX_UPLOAD_SIZE_MB}MB`
      );
      e.target.value = "";
      return;
    }
    setSizeError(null);
  }

  return (
    <FormField label={label} htmlFor={id} required={required} error={sizeError ?? error}>
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:underline"
        >
          <FileText size={13} /> ไฟล์ปัจจุบัน — เปิดดู
        </a>
      )}
      <input id={id} name={name} type="file" accept={accept} onChange={handleChange} className={inputClass} />
    </FormField>
  );
}

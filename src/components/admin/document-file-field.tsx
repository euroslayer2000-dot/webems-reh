"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { FileText, X } from "lucide-react";
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
  const [hasFile, setHasFile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      setSizeError(
        `ไฟล์ขนาด ${(file.size / 1024 / 1024).toFixed(1)}MB ใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน ${MAX_UPLOAD_SIZE_MB}MB`
      );
      e.target.value = "";
      setHasFile(false);
      return;
    }
    setSizeError(null);
    setHasFile(!!file);
  }

  function handleClear() {
    if (inputRef.current) inputRef.current.value = "";
    setSizeError(null);
    setHasFile(false);
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
      <div className="flex items-center gap-2">
        <input ref={inputRef} id={id} name={name} type="file" accept={accept} onChange={handleChange} className={`${inputClass} flex-1`} />
        {hasFile && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <X size={13} /> ลบไฟล์
          </button>
        )}
      </div>
    </FormField>
  );
}

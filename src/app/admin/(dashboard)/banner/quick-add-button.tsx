"use client";

import { useRef, type ChangeEvent } from "react";
import { Plus } from "lucide-react";
import { btnPrimary } from "@/components/admin/button-styles";
import { MAX_UPLOAD_SIZE_MB } from "@/lib/upload";
import { quickCreateBanner } from "./actions";

export function QuickAddImageButton() {
  const formRef = useRef<HTMLFormElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
      alert(`ไฟล์รูปภาพขนาด ${(file.size / 1024 / 1024).toFixed(1)}MB ใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน ${MAX_UPLOAD_SIZE_MB}MB`);
      e.target.value = "";
      return;
    }
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={quickCreateBanner}>
      <label className={`${btnPrimary} cursor-pointer`}>
        <Plus size={16} /> เพิ่มรูปภาพ
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </form>
  );
}

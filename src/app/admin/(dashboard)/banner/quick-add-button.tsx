"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { btnPrimary } from "@/components/admin/button-styles";
import { quickCreateBanner } from "./actions";

export function QuickAddImageButton() {
  const formRef = useRef<HTMLFormElement>(null);

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
          onChange={() => formRef.current?.requestSubmit()}
        />
      </label>
    </form>
  );
}

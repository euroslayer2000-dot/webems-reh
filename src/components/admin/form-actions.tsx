"use client";

import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { btnPrimary } from "./button-styles";

export function FormActions({ isPending, cancelHref, label = "บันทึก", pendingLabel = "กำลังบันทึก..." }: {
  isPending: boolean;
  cancelHref: string;
  label?: string;
  pendingLabel?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex gap-2 border-t border-border pt-5">
      <button type="submit" disabled={isPending} className={`${btnPrimary} disabled:opacity-60`}>
        <Save size={16} /> {isPending ? pendingLabel : label}
      </button>
      <button
        type="button"
        onClick={() => router.push(cancelHref)}
        className="rounded-[10px] border border-border px-5 py-2.5 text-sm font-semibold text-text hover:bg-bg-soft"
      >
        ยกเลิก
      </button>
    </div>
  );
}

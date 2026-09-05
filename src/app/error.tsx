"use client";

import { useEffect } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <TriangleAlert size={40} className="text-danger" />
      <h1 className="text-lg font-bold text-text">เกิดข้อผิดพลาดชั่วคราว</h1>
      <p className="max-w-md text-sm text-text-muted">
        ระบบไม่สามารถโหลดข้อมูลได้ในขณะนี้ อาจเกิดจากการเชื่อมต่อฐานข้อมูลสะดุดชั่วคราว กรุณาลองใหม่อีกครั้ง
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius)] bg-[image:var(--grad-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition-transform hover:-translate-y-0.5"
      >
        <RefreshCw size={15} /> ลองใหม่อีกครั้ง
      </button>
    </div>
  );
}

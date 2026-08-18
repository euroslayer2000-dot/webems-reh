"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitContact, type ContactFormState } from "./actions";

const initialState: ContactFormState = { ok: false };

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary-100 bg-primary-50 p-10 text-center">
        <CheckCircle2 className="text-primary-600" size={36} />
        <p className="font-bold text-primary-700">ส่งข้อความเรียบร้อยแล้ว</p>
        <p className="text-sm text-text-muted">ขอบคุณที่ติดต่อเรา เจ้าหน้าที่จะติดต่อกลับโดยเร็วที่สุด</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-text">ชื่อ-นามสกุล *</label>
          <input
            name="name"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
          />
          {state.errors?.name && <p className="mt-1 text-xs text-danger">{state.errors.name}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text">เบอร์โทรศัพท์</label>
          <input
            name="phone"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-text">อีเมล</label>
          <input
            name="email"
            type="email"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
          />
          {state.errors?.email && <p className="mt-1 text-xs text-danger">{state.errors.email}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-text">หัวข้อ</label>
          <input
            name="subject"
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-text">ข้อความ *</label>
        <textarea
          name="message"
          rows={5}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
        />
        {state.errors?.message && <p className="mt-1 text-xs text-danger">{state.errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-fit items-center gap-2 rounded-full bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
      >
        <Send size={14} /> {isPending ? "กำลังส่ง..." : "ส่งข้อความ"}
      </button>
    </form>
  );
}

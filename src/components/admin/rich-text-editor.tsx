"use client";

import dynamic from "next/dynamic";

const RichTextEditorInner = dynamic(
  () => import("./rich-text-editor-inner").then((m) => m.RichTextEditorInner),
  { ssr: false, loading: () => <div className="rounded-md border border-border p-3 text-sm text-text-muted">กำลังโหลดตัวแก้ไข...</div> }
);

export function RichTextEditor(props: { value: string; onChange: (html: string) => void }) {
  return <RichTextEditorInner {...props} />;
}

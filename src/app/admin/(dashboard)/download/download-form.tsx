"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { DocumentFileField } from "@/components/admin/document-file-field";
import { uploadUrl } from "@/lib/upload";
import { createDownload, updateDownload, type DownloadFormState } from "./actions";

type Category = { id: number; name: string };
type DownloadRecord = { id: number; title: string; category_id: number | null; description: string | null; file_path: string };

const initialState: DownloadFormState = { ok: false };

export function DownloadForm({ categories, doc }: { categories: Category[]; doc: DownloadRecord | null }) {
  const action = doc ? updateDownload.bind(null, doc.id) : createDownload;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <FormField label="ชื่อเอกสาร" htmlFor="title" required error={state.errors?.title}>
            <input id="title" name="title" defaultValue={doc?.title} className={inputClass} />
          </FormField>

          <FormField label="หมวดหมู่" htmlFor="category_id">
            <select id="category_id" name="category_id" defaultValue={doc?.category_id ?? ""} className={inputClass}>
              <option value="">ไม่ระบุ</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>

          <FormField label="คำอธิบาย" htmlFor="description">
            <textarea id="description" name="description" rows={3} defaultValue={doc?.description ?? ""} className={inputClass} />
          </FormField>

          <DocumentFileField
            label="ไฟล์เอกสาร (pdf, doc, docx, xls, xlsx)"
            id="file"
            name="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            required={!doc}
            error={state.errors?.file}
            currentUrl={doc ? uploadUrl(doc.file_path) : null}
          />

          <FormActions isPending={isPending} cancelHref="/admin/download" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

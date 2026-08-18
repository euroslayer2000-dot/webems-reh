"use client";

import { useActionState, useState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageFileField } from "@/components/admin/image-file-field";
import { uploadUrl } from "@/lib/upload";
import { createNews, updateNews, type NewsFormState } from "./actions";

type Category = { id: number; name: string };

type NewsRecord = {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  excerpt: string | null;
  content: string | null;
  status: string;
  cover_image: string | null;
};

const initialState: NewsFormState = { ok: false };

export function NewsForm({ categories, news }: { categories: Category[]; news: NewsRecord | null }) {
  const action = news ? updateNews.bind(null, news.id) : createNews;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [content, setContent] = useState(news?.content ?? "");

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="content" value={content} />

          <FormField label="หัวข้อข่าว" htmlFor="title" required error={state.errors?.title}>
            <input id="title" name="title" defaultValue={news?.title} className={inputClass} />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="สลัก (slug)" htmlFor="slug">
              <input id="slug" name="slug" defaultValue={news?.slug} placeholder="เว้นว่างเพื่อสร้างอัตโนมัติ" className={inputClass} />
            </FormField>

            <FormField label="หมวดหมู่" htmlFor="category_id">
              <select id="category_id" name="category_id" defaultValue={news?.category_id ?? ""} className={inputClass}>
                <option value="">ไม่ระบุ</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="สถานะ" htmlFor="status" required error={state.errors?.status}>
            <select id="status" name="status" defaultValue={news?.status ?? "draft"} className={inputClass}>
              <option value="draft">แบบร่าง</option>
              <option value="published">เผยแพร่</option>
            </select>
          </FormField>

          <FormField label="สรุปย่อ" htmlFor="excerpt" error={state.errors?.excerpt}>
            <textarea id="excerpt" name="excerpt" rows={2} defaultValue={news?.excerpt ?? ""} className={inputClass} />
          </FormField>

          <FormField label="เนื้อหา" htmlFor="content">
            <RichTextEditor value={content} onChange={setContent} />
          </FormField>

          <ImageFileField
            label="ภาพหน้าปก"
            id="cover_image"
            name="cover_image"
            currentImageUrl={news ? uploadUrl(news.cover_image) : null}
          />

          <FormActions isPending={isPending} cancelHref="/admin/news" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

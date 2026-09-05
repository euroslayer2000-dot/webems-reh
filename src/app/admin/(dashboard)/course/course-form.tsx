"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { ImageFileField } from "@/components/admin/image-file-field";
import { uploadUrl } from "@/lib/upload";
import { createCourse, updateCourse, type CourseFormState } from "./actions";

type CourseRecord = {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  cover_image: string | null;
  is_active: boolean;
};

const initialState: CourseFormState = { ok: false };

export function CourseForm({ course }: { course: CourseRecord | null }) {
  const action = course ? updateCourse.bind(null, course.id) : createCourse;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <FormField label="ชื่อหลักสูตร" htmlFor="title" required error={state.errors?.title}>
            <input id="title" name="title" defaultValue={course?.title} className={inputClass} />
          </FormField>

          <FormField label="สลัก (slug)" htmlFor="slug">
            <input id="slug" name="slug" defaultValue={course?.slug} placeholder="เว้นว่างเพื่อสร้างอัตโนมัติ" className={inputClass} />
            {course && (course.slug === "emr" || course.slug === "emt-b") && (
              <p className="mt-1.5 text-xs text-text-muted">
                หลักสูตรนี้แสดงเป็นการ์ดบนหน้าแรก — หากเปลี่ยนสลักจะต้องอัปเดตหน้าแรกตามด้วย
              </p>
            )}
          </FormField>

          <FormField label="คำอธิบายสั้น" htmlFor="short_description" error={state.errors?.short_description}>
            <textarea id="short_description" name="short_description" rows={3} defaultValue={course?.short_description ?? ""} className={inputClass} />
          </FormField>

          <label className="flex w-fit items-center gap-2 text-sm text-text">
            <input type="checkbox" name="is_active" defaultChecked={course?.is_active ?? true} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
            เผยแพร่บนเว็บไซต์
          </label>

          <ImageFileField
            label="ภาพปกหลักสูตร"
            id="cover_image"
            name="cover_image"
            currentImageUrl={course ? uploadUrl(course.cover_image) : null}
          />

          <FormActions isPending={isPending} cancelHref="/admin/course" label="บันทึกหลักสูตร" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { ImageFileField } from "@/components/admin/image-file-field";
import { uploadUrl } from "@/lib/upload";
import { createPersonnel, updatePersonnel, type PersonnelFormState } from "./actions";

const TITLES = ["นาย", "นางสาว", "นาง", "นายแพทย์", "แพทย์หญิง"];

type Group = { id: number; name: string };
type PersonnelRecord = {
  id: number;
  title: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  group_id: number | null;
  sort_order: number;
  bio: string | null;
  is_active: boolean;
  photo: string | null;
};

const initialState: PersonnelFormState = { ok: false };

export function PersonnelForm({ groups, person }: { groups: Group[]; person: PersonnelRecord | null }) {
  const action = person ? updatePersonnel.bind(null, person.id) : createPersonnel;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label="คำนำหน้า" htmlFor="title">
              <select id="title" name="title" defaultValue={person?.title ?? TITLES[0]} className={inputClass}>
                {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="ชื่อ" htmlFor="first_name" required error={state.errors?.first_name}>
              <input id="first_name" name="first_name" defaultValue={person?.first_name ?? ""} className={inputClass} />
            </FormField>
            <FormField label="นามสกุล" htmlFor="last_name" required error={state.errors?.last_name}>
              <input id="last_name" name="last_name" defaultValue={person?.last_name ?? ""} className={inputClass} />
            </FormField>
          </div>

          <FormField label="กลุ่มบุคลากร" htmlFor="group_id">
            <select id="group_id" name="group_id" defaultValue={person?.group_id ?? ""} className={`${inputClass} sm:w-64`}>
              <option value="">ไม่ระบุ</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </FormField>

          <FormField label="อีเมล" htmlFor="email" error={state.errors?.email}>
            <input id="email" name="email" type="email" defaultValue={person?.email ?? ""} className={inputClass} />
          </FormField>

          <FormField label="ประวัติย่อ" htmlFor="bio">
            <textarea id="bio" name="bio" rows={4} defaultValue={person?.bio ?? ""} className={inputClass} />
          </FormField>

          <label className="flex w-fit items-center gap-2 text-sm text-text">
            <input type="checkbox" name="is_active" defaultChecked={person?.is_active ?? true} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
            เผยแพร่บนเว็บไซต์
          </label>

          <ImageFileField label="รูปภาพ" id="photo" name="photo" currentImageUrl={person ? uploadUrl(person.photo) : null} />

          <FormActions isPending={isPending} cancelHref="/admin/personnel" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

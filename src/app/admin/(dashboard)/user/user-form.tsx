"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { createUser, updateUser, type UserFormState } from "./actions";

const ROLES: { value: string; label: string }[] = [
  { value: "superadmin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "editor", label: "Editor" },
];

type UserRecord = {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: string;
  is_active: boolean;
};

const initialState: UserFormState = { ok: false };

export function UserForm({ user, isSelf }: { user: UserRecord | null; isSelf: boolean }) {
  const action = user ? updateUser.bind(null, user.id) : createUser;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="ชื่อ" htmlFor="name" required error={state.errors?.name}>
              <input id="name" name="name" defaultValue={user?.name} className={inputClass} />
            </FormField>
            <FormField label="ชื่อผู้ใช้" htmlFor="username" required error={state.errors?.username}>
              <input id="username" name="username" defaultValue={user?.username} className={inputClass} />
            </FormField>
          </div>

          <FormField label="อีเมล" htmlFor="email" error={state.errors?.email}>
            <input id="email" name="email" type="email" defaultValue={user?.email ?? ""} className={inputClass} />
          </FormField>

          <FormField label={user ? "รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)" : "รหัสผ่าน"} htmlFor="password" required={!user} error={state.errors?.password}>
            <input id="password" name="password" type="password" className={inputClass} />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="สิทธิ์การใช้งาน" htmlFor="role">
              {isSelf ? (
                <>
                  {/* A disabled <select> wouldn't submit at all — use a plain
                      hidden input instead so the current role round-trips. */}
                  <input type="hidden" name="role" value={user?.role} />
                  <p className={`${inputClass} bg-surface-2 text-text-muted`}>{ROLES.find((r) => r.value === user?.role)?.label}</p>
                  <p className="mt-1 text-xs text-text-muted">ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้</p>
                </>
              ) : (
                <select id="role" name="role" defaultValue={user?.role ?? "editor"} className={inputClass}>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              )}
            </FormField>

            <div className="flex items-end pb-2.5">
              {isSelf ? (
                <p className="text-sm text-text-muted">บัญชีของตัวเองเปิดใช้งานอยู่เสมอ</p>
              ) : (
                <label className="flex items-center gap-2 text-sm text-text">
                  <input type="checkbox" name="is_active" defaultChecked={user?.is_active ?? true} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
                  เปิดใช้งานบัญชี
                </label>
              )}
            </div>
          </div>

          <FormActions isPending={isPending} cancelHref="/admin/user" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

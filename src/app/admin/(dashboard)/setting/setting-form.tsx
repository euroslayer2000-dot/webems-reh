"use client";

import { useActionState, useState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { AdminCard, AdminCardBody, AdminCardHead } from "@/components/admin/admin-card";
import { btnPrimary } from "@/components/admin/button-styles";
import { updateSettings, type SettingsFormState } from "./actions";

const initialState: SettingsFormState = { ok: false };

export function SettingForm({ s }: { s: Record<string, string> }) {
  const [state, formAction, isPending] = useActionState(updateSettings, initialState);
  const [vision, setVision] = useState(s.about_vision ?? "");
  const [mission, setMission] = useState(s.about_mission ?? "");
  const [history, setHistory] = useState(s.about_history ?? "");

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="about_vision" value={vision} />
      <input type="hidden" name="about_mission" value={mission} />
      <input type="hidden" name="about_history" value={history} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <AdminCardHead title="ข้อมูลทั่วไป" />
          <AdminCardBody className="grid gap-4">
            <FormField label="ชื่อเว็บไซต์" htmlFor="site_name" required error={state.errors?.site_name}>
              <input id="site_name" name="site_name" defaultValue={s.site_name} className={inputClass} />
            </FormField>
            <FormField label="คำโปรย (Tagline)" htmlFor="site_tagline">
              <input id="site_tagline" name="site_tagline" defaultValue={s.site_tagline} className={inputClass} />
            </FormField>
          </AdminCardBody>
        </AdminCard>

        <AdminCard>
          <AdminCardHead title="โซเชียลมีเดีย" />
          <AdminCardBody className="grid gap-4">
            <FormField label="Facebook URL" htmlFor="facebook" error={state.errors?.facebook}>
              <input id="facebook" name="facebook" placeholder="https://facebook.com/..." defaultValue={s.facebook} className={inputClass} />
            </FormField>
            <FormField label="Line URL" htmlFor="line" error={state.errors?.line}>
              <input id="line" name="line" placeholder="https://line.me/..." defaultValue={s.line} className={inputClass} />
            </FormField>
            <FormField label="YouTube URL" htmlFor="youtube" error={state.errors?.youtube}>
              <input id="youtube" name="youtube" placeholder="https://youtube.com/..." defaultValue={s.youtube} className={inputClass} />
            </FormField>
          </AdminCardBody>
        </AdminCard>
      </div>

      <AdminCard>
        <AdminCardHead title="ข้อมูลการติดต่อ" />
        <AdminCardBody className="grid gap-4 sm:grid-cols-3">
          <FormField label="สายด่วนฉุกเฉิน" htmlFor="emergency_phone" error={state.errors?.emergency_phone}>
            <input id="emergency_phone" name="emergency_phone" placeholder="1669" defaultValue={s.emergency_phone} className={inputClass} />
          </FormField>
          <FormField label="โทรศัพท์สำนักงาน" htmlFor="office_phone" error={state.errors?.office_phone}>
            <input id="office_phone" name="office_phone" placeholder="043-518-200" defaultValue={s.office_phone} className={inputClass} />
          </FormField>
          <FormField label="อีเมล" htmlFor="email" error={state.errors?.email}>
            <input id="email" name="email" type="email" placeholder="name@example.com" defaultValue={s.email} className={inputClass} />
          </FormField>
          <div className="sm:col-span-3">
            <FormField label="ที่อยู่" htmlFor="address">
              <input id="address" name="address" defaultValue={s.address} className={inputClass} />
            </FormField>
          </div>
          <div className="sm:col-span-3">
            <FormField label="Google Map (โค้ด iframe ฝัง)" htmlFor="map_embed" error={state.errors?.map_embed}>
              <textarea
                id="map_embed"
                name="map_embed"
                rows={3}
                defaultValue={s.map_embed}
                placeholder='<iframe src="https://www.google.com/maps/embed?...">'
                className={inputClass}
              />
            </FormField>
            <p className="mt-1 text-xs text-text-muted">
              ไปที่ Google Maps → ค้นหาสถานที่ → กด &quot;แชร์&quot; → เลือกแท็บ &quot;ฝังแผนที่&quot; (Embed a map) → กด &quot;คัดลอก HTML&quot;
              แล้ววางทั้งก้อนที่นี่ (ต้องขึ้นต้นด้วย <code>&lt;iframe</code>)
            </p>
          </div>
        </AdminCardBody>
      </AdminCard>

      <AdminCard>
        <AdminCardHead title="เกี่ยวกับเรา" />
        <AdminCardBody className="grid gap-5">
          <FormField label="วิสัยทัศน์" htmlFor="about_vision_editor">
            <RichTextEditor value={vision} onChange={setVision} />
          </FormField>
          <FormField label="พันธกิจ" htmlFor="about_mission_editor">
            <RichTextEditor value={mission} onChange={setMission} />
          </FormField>
          <FormField label="ประวัติความเป็นมา" htmlFor="about_history_editor">
            <RichTextEditor value={history} onChange={setHistory} />
          </FormField>
        </AdminCardBody>
      </AdminCard>

      <button type="submit" disabled={isPending} className={`w-fit ${btnPrimary} disabled:opacity-60`}>
        {isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </button>
    </form>
  );
}

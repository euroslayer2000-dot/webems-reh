"use client";

import { useActionState, useState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { LocationPickerMapLoader } from "@/components/admin/location-picker-map-loader";
import { createAed, updateAed, type AedFormState } from "./actions";

type AedRecord = {
  id: number;
  name: string;
  lat: unknown;
  lng: unknown;
  address: string | null;
  detail: string | null;
  open_hours: string | null;
  phone: string | null;
  is_active: boolean;
};

const initialState: AedFormState = { ok: false };

export function AedForm({ aed }: { aed: AedRecord | null }) {
  const action = aed ? updateAed.bind(null, aed.id) : createAed;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [lat, setLat] = useState(aed?.lat != null ? String(aed.lat) : "");
  const [lng, setLng] = useState(aed?.lng != null ? String(aed.lng) : "");
  const latNum = lat.trim() !== "" && !Number.isNaN(Number(lat)) ? Number(lat) : null;
  const lngNum = lng.trim() !== "" && !Number.isNaN(Number(lng)) ? Number(lng) : null;

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <FormField label="ชื่อสถานที่" htmlFor="name" required error={state.errors?.name}>
            <input id="name" name="name" defaultValue={aed?.name} className={inputClass} />
          </FormField>

          <FormField label="ตำแหน่งที่วางเครื่อง" htmlFor="detail">
            <input id="detail" name="detail" placeholder="เช่น ชั้น 1 ข้างเคาน์เตอร์ประชาสัมพันธ์" defaultValue={aed?.detail ?? ""} className={inputClass} />
          </FormField>

          <div>
            <label className="mb-1 block text-sm font-semibold text-text">
              ตำแหน่งบนแผนที่ <span className="text-danger">*</span>
            </label>
            <p className="mb-2 text-xs text-text-muted">คลิกบนแผนที่เพื่อปักหมุด — พิกัดจะกรอกให้อัตโนมัติ</p>
            <div className="h-80 overflow-hidden rounded-[10px] border border-border">
              <LocationPickerMapLoader
                lat={latNum}
                lng={lngNum}
                onPick={(la, ln) => {
                  setLat(la.toFixed(7));
                  setLng(ln.toFixed(7));
                }}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="ละติจูด" htmlFor="lat" required error={state.errors?.lat}>
              <input id="lat" name="lat" type="text" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="ลองจิจูด" htmlFor="lng" required error={state.errors?.lng}>
              <input id="lng" name="lng" type="text" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} className={inputClass} />
            </FormField>
          </div>

          <FormField label="ที่อยู่" htmlFor="address">
            <input id="address" name="address" defaultValue={aed?.address ?? ""} className={inputClass} />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="เวลาเปิด-ปิด" htmlFor="open_hours">
              <input id="open_hours" name="open_hours" placeholder="เช่น 24 ชั่วโมง" defaultValue={aed?.open_hours ?? ""} className={inputClass} />
            </FormField>
            <FormField label="เบอร์โทร" htmlFor="phone">
              <input id="phone" name="phone" defaultValue={aed?.phone ?? ""} className={inputClass} />
            </FormField>
          </div>

          <label className="flex w-fit items-center gap-2 text-sm text-text">
            <input type="checkbox" name="is_active" defaultChecked={aed?.is_active ?? true} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
            เผยแพร่บนเว็บไซต์
          </label>

          <FormActions isPending={isPending} cancelHref="/admin/aed" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

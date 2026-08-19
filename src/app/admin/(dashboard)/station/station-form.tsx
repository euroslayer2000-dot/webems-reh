"use client";

import { useActionState, useState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { ImageFileField } from "@/components/admin/image-file-field";
import { LocationPickerMapLoader } from "@/components/admin/location-picker-map-loader";
import { uploadUrl } from "@/lib/upload";
import { createStation, updateStation, type StationFormState } from "./actions";

type StationRecord = {
  id: number;
  name: string;
  code: string | null;
  type: string;
  lat: unknown;
  lng: unknown;
  address: string | null;
  phone: string | null;
  service_area: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  photo: string | null;
};

const initialState: StationFormState = { ok: false };

export function StationForm({ station }: { station: StationRecord | null }) {
  const action = station ? updateStation.bind(null, station.id) : createStation;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [lat, setLat] = useState(station?.lat != null ? String(station.lat) : "");
  const [lng, setLng] = useState(station?.lng != null ? String(station.lng) : "");
  const latNum = lat.trim() !== "" && !Number.isNaN(Number(lat)) ? Number(lat) : null;
  const lngNum = lng.trim() !== "" && !Number.isNaN(Number(lng)) ? Number(lng) : null;

  function handlePick(pickedLat: number, pickedLng: number) {
    setLat(pickedLat.toFixed(7));
    setLng(pickedLng.toFixed(7));
  }

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="ชื่อหน่วย" htmlFor="name" required error={state.errors?.name}>
              <input id="name" name="name" defaultValue={station?.name} className={inputClass} />
            </FormField>
            <FormField label="รหัสหน่วย" htmlFor="code">
              <input id="code" name="code" defaultValue={station?.code ?? ""} className={inputClass} />
            </FormField>
          </div>

          <FormField label="ประเภท" htmlFor="type" required>
            <select id="type" name="type" defaultValue={station?.type ?? "ALS"} className={`${inputClass} sm:w-56`}>
              <option value="ALS">ALS</option>
              <option value="BLS">BLS</option>
            </select>
          </FormField>

          <div>
            <label className="mb-1 block text-sm font-semibold text-text">
              ตำแหน่งที่ตั้ง <span className="text-danger">*</span>
            </label>
            <p className="mb-2 text-xs text-text-muted">คลิกบนแผนที่เพื่อปักหมุด — พิกัดจะกรอกให้อัตโนมัติ</p>
            <div className="h-80 overflow-hidden rounded-[10px] border border-border">
              <LocationPickerMapLoader lat={latNum} lng={lngNum} onPick={handlePick} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="ละติจูด" htmlFor="lat" required error={state.errors?.lat}>
              <input
                id="lat"
                name="lat"
                type="text"
                inputMode="decimal"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={inputClass}
              />
            </FormField>
            <FormField label="ลองจิจูด" htmlFor="lng" required error={state.errors?.lng}>
              <input
                id="lng"
                name="lng"
                type="text"
                inputMode="decimal"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField label="ที่อยู่" htmlFor="address">
            <input id="address" name="address" defaultValue={station?.address ?? ""} className={inputClass} />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="เบอร์โทร" htmlFor="phone">
              <input id="phone" name="phone" defaultValue={station?.phone ?? ""} className={inputClass} />
            </FormField>
            <FormField label="พื้นที่รับผิดชอบ" htmlFor="service_area">
              <input id="service_area" name="service_area" defaultValue={station?.service_area ?? ""} className={inputClass} />
            </FormField>
          </div>

          <FormField label="รายละเอียด" htmlFor="description">
            <textarea id="description" name="description" rows={3} defaultValue={station?.description ?? ""} className={inputClass} />
          </FormField>

          <label className="flex w-fit items-center gap-2 text-sm text-text">
            <input type="checkbox" name="is_active" defaultChecked={station?.is_active ?? true} className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500" />
            เผยแพร่บนเว็บไซต์
          </label>

          <ImageFileField label="รูปภาพ" id="photo" name="photo" currentImageUrl={station ? uploadUrl(station.photo) : null} />

          <FormActions isPending={isPending} cancelHref="/admin/station" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

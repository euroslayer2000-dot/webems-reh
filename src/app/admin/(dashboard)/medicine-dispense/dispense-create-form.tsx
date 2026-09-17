"use client";

import { useActionState, useMemo, useState, type ChangeEvent } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { formatDateTh } from "@/lib/format";
import { medicineNeedsWitness, MEDICINE_CLASSIFICATION_META } from "@/lib/medicine-meta";
import { createDispense, type DispenseFormState } from "./actions";

type Batch = { id: number; lot_no: string; expiry_date: Date; quantity_on_hand: number };
type MedicineOption = {
  id: number;
  generic_name: string;
  trade_name: string | null;
  unit: string;
  classification: keyof typeof MEDICINE_CLASSIFICATION_META;
  batches: Batch[];
};
type PatientReportOption = { id: number; report_date: Date };

const initialState: DispenseFormState = { ok: false };

export function DispenseCreateForm({ medicines, patientReports }: { medicines: MedicineOption[]; patientReports: PatientReportOption[] }) {
  const [state, formAction, isPending] = useActionState(createDispense, initialState);
  const now = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [medicineId, setMedicineId] = useState<number | null>(null);
  const [batchId, setBatchId] = useState<number | null>(null);

  const selectedMedicine = useMemo(() => medicines.find((m) => m.id === medicineId) ?? null, [medicines, medicineId]);
  const selectedBatch = useMemo(() => selectedMedicine?.batches.find((b) => b.id === batchId) ?? null, [selectedMedicine, batchId]);
  const needsWitness = selectedMedicine ? medicineNeedsWitness(selectedMedicine.classification) : false;

  function handleMedicineChange(e: ChangeEvent<HTMLSelectElement>) {
    const id = Number(e.target.value) || null;
    setMedicineId(id);
    setBatchId(null);
  }

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="ยา" htmlFor="medicine_select" required>
              <select id="medicine_select" className={inputClass} onChange={handleMedicineChange} value={medicineId ?? ""}>
                <option value="">เลือกยา</option>
                {medicines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.generic_name}{m.trade_name ? ` (${m.trade_name})` : ""}
                  </option>
                ))}
              </select>
              {medicines.length === 0 && <p className="mt-1 text-xs text-danger">ไม่มียาที่พร้อมจ่ายในขณะนี้ (สต๊อกหมดหรือหมดอายุทั้งหมด)</p>}
            </FormField>

            <FormField label="ล็อต (เรียงตามวันหมดอายุใกล้สุดก่อน)" htmlFor="batch_id" required error={state.errors?.batch_id}>
              <select
                id="batch_id"
                name="batch_id"
                className={inputClass}
                value={batchId ?? ""}
                onChange={(e) => setBatchId(Number(e.target.value) || null)}
                disabled={!selectedMedicine}
              >
                <option value="">เลือกล็อต</option>
                {selectedMedicine?.batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.lot_no} — หมดอายุ {formatDateTh(b.expiry_date)} — คงเหลือ {b.quantity_on_hand} {selectedMedicine.unit}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {selectedMedicine && (
            <div className="rounded-[10px] border border-border bg-bg-soft p-3.5 text-sm">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${MEDICINE_CLASSIFICATION_META[selectedMedicine.classification].className}`}>
                {MEDICINE_CLASSIFICATION_META[selectedMedicine.classification].label}
              </span>
              {needsWitness && <span className="ml-2 text-xs font-semibold text-danger">ต้องมีพยานยืนยันการจ่ายยานี้</span>}
              {selectedBatch && (
                <div className="mt-2 text-xs text-text-muted">
                  คงเหลือในล็อตนี้ <strong>{selectedBatch.quantity_on_hand}</strong> {selectedMedicine.unit}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="จำนวนที่จ่าย" htmlFor="qty" required error={state.errors?.qty}>
              <input id="qty" name="qty" type="number" min="1" max={selectedBatch?.quantity_on_hand} className={inputClass} />
            </FormField>
            <FormField label="วันเวลาที่ใช้" htmlFor="used_at" required error={state.errors?.used_at}>
              <input id="used_at" name="used_at" type="datetime-local" defaultValue={now} className={inputClass} />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="ผู้ใช้ยา/ผู้บันทึก" htmlFor="used_by" required error={state.errors?.used_by}>
              <input id="used_by" name="used_by" className={inputClass} />
            </FormField>
            <FormField label="สถานี/หน่วยรถ" htmlFor="station">
              <input id="station" name="station" className={inputClass} />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="เคสผู้ป่วยที่เกี่ยวข้อง (ถ้ามี)" htmlFor="patient_report_id">
              <select id="patient_report_id" name="patient_report_id" className={inputClass}>
                <option value="">ไม่ระบุ</option>
                {patientReports.map((r) => <option key={r.id} value={r.id}>{formatDateTh(r.report_date)}</option>)}
              </select>
            </FormField>
            <FormField
              label={`ชื่อพยาน${needsWitness ? " (บังคับสำหรับยากลุ่มนี้)" : ""}`}
              htmlFor="witness_name"
              required={needsWitness}
            >
              <input id="witness_name" name="witness_name" required={needsWitness} className={inputClass} />
            </FormField>
          </div>

          <FormField label="หมายเหตุ" htmlFor="note">
            <textarea id="note" name="note" rows={3} className={inputClass} />
          </FormField>

          <FormActions isPending={isPending} cancelHref="/admin/medicine-dispense" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

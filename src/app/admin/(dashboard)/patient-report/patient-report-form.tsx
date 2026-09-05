"use client";

import { useActionState } from "react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { FormActions } from "@/components/admin/form-actions";
import { AdminCard, AdminCardBody } from "@/components/admin/admin-card";
import { createPatientReport, updatePatientReport, type PatientReportFormState } from "./actions";

type PatientReportRecord = {
  id: number;
  report_date: Date;
  patient_count: number;
  emergency_count: number;
  traffic_injury_count: number;
  general_injury_count: number;
  note: string | null;
};

const initialState: PatientReportFormState = { ok: false };

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function PatientReportForm({ report }: { report: PatientReportRecord | null }) {
  const action = report ? updatePatientReport.bind(null, report.id) : createPatientReport;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AdminCard>
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <FormField label="วันที่รับแจ้งเหตุ" htmlFor="report_date" required error={state.errors?.report_date}>
            <input
              id="report_date"
              name="report_date"
              type="date"
              defaultValue={report ? toDateInputValue(report.report_date) : toDateInputValue(new Date())}
              className={`${inputClass} sm:w-56`}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="จำนวนผู้ป่วยต่อปี (รวม)" htmlFor="patient_count" required error={state.errors?.patient_count}>
              <input
                id="patient_count"
                name="patient_count"
                type="number"
                min={0}
                defaultValue={report?.patient_count ?? 0}
                className={inputClass}
              />
            </FormField>
            <FormField label="จำนวนผู้ป่วยฉุกเฉิน" htmlFor="emergency_count" required error={state.errors?.emergency_count}>
              <input
                id="emergency_count"
                name="emergency_count"
                type="number"
                min={0}
                defaultValue={report?.emergency_count ?? 0}
                className={inputClass}
              />
            </FormField>
            <FormField label="จำนวนผู้บาดเจ็บจราจร" htmlFor="traffic_injury_count" required error={state.errors?.traffic_injury_count}>
              <input
                id="traffic_injury_count"
                name="traffic_injury_count"
                type="number"
                min={0}
                defaultValue={report?.traffic_injury_count ?? 0}
                className={inputClass}
              />
            </FormField>
            <FormField
              label="จำนวนผู้บาดเจ็บอุบัติเหตุทั่วไป"
              htmlFor="general_injury_count"
              required
              error={state.errors?.general_injury_count}
            >
              <input
                id="general_injury_count"
                name="general_injury_count"
                type="number"
                min={0}
                defaultValue={report?.general_injury_count ?? 0}
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField label="หมายเหตุ" htmlFor="note">
            <textarea id="note" name="note" rows={3} defaultValue={report?.note ?? ""} className={inputClass} />
          </FormField>

          <FormActions isPending={isPending} cancelHref="/admin/patient-report" label="บันทึกข้อมูล" />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

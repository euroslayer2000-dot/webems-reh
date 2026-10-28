"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Save } from "lucide-react";
import { FormField, inputClass } from "@/components/admin/form-field";
import { AdminCard, AdminCardBody, AdminCardHead } from "@/components/admin/admin-card";
import { btnPrimary } from "@/components/admin/button-styles";
import {
  calcMonthly,
  FT_EMS_INDICATORS,
  FT_EMS_MONTHS,
  FT_EMS_TRACKS,
  type MonthlyCounts,
} from "@/lib/ft-ems-config";
import { loadIndicator, loadMonthly, saveIndicator, saveMonthly, type FtEmsFormState } from "./actions";

const initialState: FtEmsFormState = { ok: false };
const emptyCounts = { walkin: "", als: "", bls: "", emr: "" };

/** Digits only, so a date or text can't be typed/pasted into a count field. */
const digitsOnly = (v: string) => v.replace(/\D/g, "");
const toNumber = (v: string) => (v === "" ? 0 : Number(v));

function Banner({ state }: { state: FtEmsFormState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-[10px] px-4 py-2.5 text-sm font-semibold ${state.ok ? "bg-primary-500/10 text-primary-600" : "bg-danger/10 text-danger"}`}
    >
      {state.message}
    </p>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button type="submit" disabled={pending} className={`${btnPrimary} w-fit disabled:opacity-60`}>
      <Save size={16} /> {pending ? "กำลังบันทึก..." : "บันทึกลง Google Sheet"}
    </button>
  );
}

const monthOptions = FT_EMS_MONTHS.map((label, i) => (
  <option key={label} value={i}>
    {label}
  </option>
));

function MonthlyForm() {
  const [state, formAction, isPending] = useActionState(saveMonthly, initialState);
  const [month, setMonth] = useState(0);
  const [track, setTrack] = useState<string>(FT_EMS_TRACKS[0]);
  const [values, setValues] = useState(emptyCounts);
  const [loading, startLoad] = useTransition();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedNote, setLoadedNote] = useState<string | null>(null);

  // Load any existing row for this month/track so it can be edited in place.
  useEffect(() => {
    let cancelled = false;
    startLoad(async () => {
      const res = await loadMonthly(month, track);
      if (cancelled) return;
      if (res && "error" in res) {
        setLoadError(res.error);
        setLoadedNote(null);
        return;
      }
      setLoadError(null);
      setLoadedNote(res ? "โหลดข้อมูลเดิมจาก Google Sheet แล้ว — แก้ไขแล้วบันทึกทับได้" : null);
      setValues(res ? { walkin: String(res.walkin), als: String(res.als), bls: String(res.bls), emr: String(res.emr) } : emptyCounts);
    });
    return () => {
      cancelled = true;
    };
  }, [month, track]);

  const counts: MonthlyCounts = {
    walkin: toNumber(values.walkin),
    als: toNumber(values.als),
    bls: toNumber(values.bls),
    emr: toNumber(values.emr),
  };
  const { ems, all, emsPercent } = calcMonthly(counts);

  const field = (key: keyof typeof emptyCounts, label: string) => (
    <FormField label={label} htmlFor={key} required error={state.errors?.[key]}>
      <input
        id={key}
        name={key}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={values[key]}
        onChange={(e) => setValues((v) => ({ ...v, [key]: digitsOnly(e.target.value) }))}
        className={inputClass}
      />
    </FormField>
  );

  return (
    <AdminCard>
      <AdminCardHead title="ส่วนที่ 1: จำนวนผู้ป่วย Fast track รายเดือน" />
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="เดือน" htmlFor="month" required>
              <select id="month" name="month" value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputClass}>
                {monthOptions}
              </select>
            </FormField>
            <FormField label="Fast track" htmlFor="track" required>
              <select id="track" name="track" value={track} onChange={(e) => setTrack(e.target.value)} className={inputClass}>
                {FT_EMS_TRACKS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </FormField>
          </div>

          {loading && <p className="text-xs text-text-muted">กำลังโหลดข้อมูลจาก Google Sheet...</p>}
          {loadError && <p role="alert" className="text-xs text-danger">{loadError}</p>}
          {loadedNote && !loading && <p className="text-xs text-primary-600">{loadedNote}</p>}

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {field("walkin", "Walk in")}
            {field("als", "ALS")}
            {field("bls", "BLS")}
            {field("emr", "EMR")}
          </div>

          <dl className="grid grid-cols-3 gap-3 rounded-[10px] bg-surface-2 p-4 text-center">
            <div>
              <dt className="text-xs text-text-muted">EMS</dt>
              <dd className="text-xl font-extrabold text-text">{ems}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">All</dt>
              <dd className="text-xl font-extrabold text-text">{all}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">การเข้าระบบ EMS</dt>
              <dd className="text-xl font-extrabold text-text">{emsPercent == null ? "" : `${emsPercent.toFixed(2)}%`}</dd>
            </div>
          </dl>

          <Banner state={state} />
          <SubmitButton pending={isPending} />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

function IndicatorForm() {
  const [state, formAction, isPending] = useActionState(saveIndicator, initialState);
  const [month, setMonth] = useState(0);
  const [indicator, setIndicator] = useState<string>(FT_EMS_INDICATORS[0].key);
  const [percent, setPercent] = useState("");
  const [loading, startLoad] = useTransition();
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    startLoad(async () => {
      const res = await loadIndicator(month, indicator);
      if (cancelled) return;
      if (res !== null && typeof res === "object") {
        setLoadError(res.error);
        return;
      }
      setLoadError(null);
      setPercent(res == null ? "" : String(res));
    });
    return () => {
      cancelled = true;
    };
  }, [month, indicator]);

  const target = indicator === "ROSC" ? 25 : null;
  const num = percent === "" ? null : Number(percent);

  return (
    <AdminCard>
      <AdminCardHead title="ส่วนที่ 2: ตัวชี้วัดอื่น (ร้อยละรายเดือน)" />
      <AdminCardBody>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="เดือน" htmlFor="ind-month" required>
              <select id="ind-month" name="month" value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputClass}>
                {monthOptions}
              </select>
            </FormField>
            <FormField label="ตัวชี้วัด" htmlFor="indicator" required>
              <select id="indicator" name="indicator" value={indicator} onChange={(e) => setIndicator(e.target.value)} className={inputClass}>
                {FT_EMS_INDICATORS.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {loading && <p className="text-xs text-text-muted">กำลังโหลดข้อมูลจาก Google Sheet...</p>}
          {loadError && <p role="alert" className="text-xs text-danger">{loadError}</p>}

          <FormField label="ร้อยละ (%)" htmlFor="percent" required error={state.errors?.percent}>
            <input
              id="percent"
              name="percent"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={percent}
              onChange={(e) => setPercent(e.target.value.replace(/[^\d.]/g, ""))}
              className={inputClass}
            />
          </FormField>
          {target != null && (
            <p className={`text-xs font-semibold ${num == null ? "text-text-muted" : num >= target ? "text-primary-600" : "text-danger"}`}>
              เป้าหมาย ≥ {target}%{num != null && (num >= target ? " — ผ่านเป้า" : " — ไม่ผ่านเป้า")}
            </p>
          )}

          <Banner state={state} />
          <SubmitButton pending={isPending} />
        </form>
      </AdminCardBody>
    </AdminCard>
  );
}

export function FtEmsForms() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <MonthlyForm />
      <IndicatorForm />
    </div>
  );
}

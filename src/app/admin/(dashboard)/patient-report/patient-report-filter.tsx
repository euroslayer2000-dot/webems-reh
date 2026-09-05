"use client";

import { useRouter } from "next/navigation";
import { THAI_MONTHS } from "@/lib/format";
import { inputClass } from "@/components/admin/form-field";

export function PatientReportFilter({ years, year, month }: { years: number[]; year: number; month: number | null }) {
  const router = useRouter();

  function go(nextYear: number, nextMonth: number | null) {
    const qs = new URLSearchParams({ year: String(nextYear) });
    if (nextMonth) qs.set("month", String(nextMonth));
    router.push(`/admin/patient-report?${qs.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={year}
        onChange={(e) => go(Number(e.target.value), month)}
        aria-label="เลือกปี"
        className={`${inputClass} w-auto`}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            ปี {y + 543}
          </option>
        ))}
      </select>
      <select
        value={month ?? ""}
        onChange={(e) => go(year, e.target.value ? Number(e.target.value) : null)}
        aria-label="เลือกเดือน"
        className={`${inputClass} w-auto`}
      >
        <option value="">ทั้งปี</option>
        {THAI_MONTHS.map((label, i) => (
          <option key={label} value={i + 1}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

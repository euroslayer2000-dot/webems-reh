import Link from "next/link";
import { Ambulance, Award, HeartPulse, Plus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh, THAI_MONTHS } from "@/lib/format";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { StatCard } from "@/components/admin/stat-card";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deletePatientReport } from "./actions";
import { PatientReportFilter } from "./patient-report-filter";

export default async function AdminPatientReportPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  await requirePageAccess("patientreport");
  const { year: rawYear, month: rawMonth } = await searchParams;

  const currentYear = new Date().getFullYear();

  const yearRows = await prisma.$queryRaw<{ year: number }[]>`
    SELECT DISTINCT EXTRACT(YEAR FROM report_date)::int AS year FROM patient_reports ORDER BY year DESC
  `;
  const years = Array.from(new Set([currentYear, ...yearRows.map((r) => r.year)])).sort((a, b) => b - a);

  const year = rawYear && years.includes(Number(rawYear)) ? Number(rawYear) : currentYear;
  const month = rawMonth && Number(rawMonth) >= 1 && Number(rawMonth) <= 12 ? Number(rawMonth) : null;

  const start = month ? new Date(Date.UTC(year, month - 1, 1)) : new Date(Date.UTC(year, 0, 1));
  const end = month ? new Date(Date.UTC(year, month, 1)) : new Date(Date.UTC(year + 1, 0, 1));

  const reports = await prisma.patientReport.findMany({
    where: { report_date: { gte: start, lt: end } },
    orderBy: { report_date: "desc" },
  });

  const summary = reports.reduce(
    (acc, r) => {
      acc.patient_count += r.patient_count;
      acc.emergency_count += r.emergency_count;
      acc.traffic_injury_count += r.traffic_injury_count;
      acc.general_injury_count += r.general_injury_count;
      return acc;
    },
    { patient_count: 0, emergency_count: 0, traffic_injury_count: 0, general_injury_count: 0 }
  );

  return (
    <div>
      <PageHead
        title="ข้อมูลรับแจ้งเหตุ"
        subtitle="บันทึกจำนวนผู้ป่วยรายวัน และสรุปยอดรายวัน/เดือน/ปี"
        action={
          <Link href="/admin/patient-report/create" className={btnPrimary}>
            <Plus size={16} /> เพิ่มข้อมูลรายวัน
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <PatientReportFilter years={years} year={year} month={month} />
        <p className="text-sm text-text-muted">
          สรุปยอด{month ? `เดือน ${monthLabel(month)} ปี ${year + 543}` : `ปี ${year + 543}`} ({reports.length.toLocaleString("th-TH")} วันที่มีข้อมูล)
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} value={summary.patient_count} label="จำนวนผู้ป่วย" color="green" />
        <StatCard icon={HeartPulse} value={summary.emergency_count} label="จำนวนผู้ป่วยฉุกเฉิน" color="pink" />
        <StatCard icon={Ambulance} value={summary.traffic_injury_count} label="จำนวนผู้บาดเจ็บจราจร" color="orange" />
        <StatCard icon={Award} value={summary.general_injury_count} label="จำนวนผู้บาดเจ็บอุบัติเหตุทั่วไป" color="blue" />
      </div>

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">วันที่</th>
              <th className="px-5 py-3">ผู้ป่วย</th>
              <th className="px-5 py-3">ผู้ป่วยฉุกเฉิน</th>
              <th className="px-5 py-3">บาดเจ็บจราจร</th>
              <th className="px-5 py-3">บาดเจ็บอุบัติเหตุทั่วไป</th>
              <th className="px-5 py-3">หมายเหตุ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-2.5 font-semibold text-text">{formatDateTh(r.report_date)}</td>
                <td className="px-5 py-2.5 text-text">{r.patient_count.toLocaleString("th-TH")}</td>
                <td className="px-5 py-2.5 text-text">{r.emergency_count.toLocaleString("th-TH")}</td>
                <td className="px-5 py-2.5 text-text">{r.traffic_injury_count.toLocaleString("th-TH")}</td>
                <td className="px-5 py-2.5 text-text">{r.general_injury_count.toLocaleString("th-TH")}</td>
                <td className="max-w-xs truncate px-5 py-2.5 text-text-muted">{r.note ?? "-"}</td>
                <td className="px-5 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/admin/patient-report/${r.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                    <form action={deletePatientReport}>
                      <input type="hidden" name="id" value={r.id} />
                      <ConfirmSubmitButton confirmText={`ลบข้อมูลวันที่ ${formatDateTh(r.report_date)} ?`} className={btnDangerSm}>
                        ลบ
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-text-muted">ยังไม่มีข้อมูลในช่วงที่เลือก</td></tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

function monthLabel(month: number): string {
  return THAI_MONTHS[month - 1];
}

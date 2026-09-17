import Image from "next/image";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { uploadUrl } from "@/lib/upload";
import { PERIOD_LABELS, periodDateRange, type Period } from "@/lib/equipment-notifications";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { inputClass } from "@/components/admin/form-field";
import { btnGhostSm, btnPrimary } from "@/components/admin/button-styles";

export default async function MedicineDispensePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; medicine_id?: string; station?: string }>;
}) {
  await requirePageAccess("medicinedispense");
  const { period: rawPeriod, medicine_id, station } = await searchParams;
  const period: Period = (["day", "week", "month", "year", "all"] as const).includes(rawPeriod as Period)
    ? (rawPeriod as Period)
    : "all";

  const periodRange = periodDateRange(period);
  const where = {
    ...(periodRange ? { used_at: { gte: periodRange.gte, lte: periodRange.lte } } : {}),
    ...(medicine_id ? { batch: { medicine_id: Number(medicine_id) } } : {}),
    ...(station ? { station: { contains: station } } : {}),
  };

  const [dispenses, medicines] = await Promise.all([
    prisma.medicineDispense.findMany({
      where,
      include: { batch: { include: { medicine: true } }, patient_report: true },
      orderBy: { used_at: "desc" },
    }),
    prisma.medicine.findMany({ orderBy: { generic_name: "asc" }, select: { id: true, generic_name: true } }),
  ]);

  const exportQs = new URLSearchParams();
  if (period !== "all") exportQs.set("period", period);
  if (medicine_id) exportQs.set("medicine_id", medicine_id);
  if (station) exportQs.set("station", station);

  return (
    <div>
      <PageHead
        title="จ่ายยา / ประวัติการใช้"
        action={
          <div className="flex gap-2">
            <Link href={`/admin/medicine-dispense/export?${exportQs.toString()}`} className={`${btnGhostSm} inline-flex items-center gap-1.5`}>
              <Download size={16} /> ส่งออก Excel/CSV
            </Link>
            <Link href="/admin/medicine-dispense/create" className={btnPrimary}>
              <Plus size={16} /> บันทึกการจ่ายยา
            </Link>
          </div>
        }
      />

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="period" value={period} />
        <div className="min-w-[200px]">
          <label htmlFor="medicine_id" className="mb-1 block text-xs font-semibold text-text-muted">ยา</label>
          <select id="medicine_id" name="medicine_id" defaultValue={medicine_id ?? ""} className={inputClass}>
            <option value="">ทุกรายการ</option>
            {medicines.map((m) => <option key={m.id} value={m.id}>{m.generic_name}</option>)}
          </select>
        </div>
        <div className="min-w-[180px]">
          <label htmlFor="station" className="mb-1 block text-xs font-semibold text-text-muted">สถานี/หน่วย</label>
          <input id="station" name="station" defaultValue={station ?? ""} className={inputClass} />
        </div>
        <button type="submit" className={btnGhostSm}>กรอง</button>
        {(medicine_id || station) && <Link href="/admin/medicine-dispense" className={btnGhostSm}>ล้างตัวกรอง</Link>}
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => {
          const qs = new URLSearchParams();
          if (p !== "all") qs.set("period", p);
          if (medicine_id) qs.set("medicine_id", medicine_id);
          if (station) qs.set("station", station);
          return (
            <Link
              key={p}
              href={`/admin/medicine-dispense?${qs.toString()}`}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
                period === p ? "border-transparent bg-[image:var(--grad-primary)] text-white" : "border-border text-text-muted hover:bg-bg-soft"
              }`}
            >
              {PERIOD_LABELS[p]}
            </Link>
          );
        })}
      </div>

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">ยา</th>
              <th className="px-5 py-3">ล็อต</th>
              <th className="px-5 py-3">จำนวน</th>
              <th className="px-5 py-3">ผู้ใช้</th>
              <th className="px-5 py-3">สถานี/หน่วย</th>
              <th className="px-5 py-3">วันเวลา</th>
              <th className="px-5 py-3">พยาน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dispenses.map((d) => (
              <tr key={d.id}>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                      <Image src={uploadUrl(d.batch.medicine.photo)} alt="" fill sizes="36px" className="object-cover" />
                    </div>
                    <div>
                      <div className="font-semibold text-text">{d.batch.medicine.generic_name}</div>
                      {d.patient_report && <div className="text-xs text-text-muted">เคส {formatDateTh(d.patient_report.report_date)}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-2.5 font-mono text-text-muted">{d.batch.lot_no}</td>
                <td className="px-5 py-2.5 text-text-muted">{d.qty} {d.batch.medicine.unit}</td>
                <td className="px-5 py-2.5 text-text">{d.used_by}</td>
                <td className="px-5 py-2.5 text-text-muted">{d.station ?? "-"}</td>
                <td className="px-5 py-2.5 text-text-muted">{formatDateTh(d.used_at, true)}</td>
                <td className="px-5 py-2.5 text-text-muted">{d.witness_name ?? "-"}</td>
              </tr>
            ))}
            {dispenses.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-text-muted">ยังไม่มีรายการจ่ายยา</td></tr>}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

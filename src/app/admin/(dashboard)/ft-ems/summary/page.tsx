import Link from "next/link";
import { Pencil } from "lucide-react";
import { requirePageAccess } from "@/lib/admin-auth";
import { callFtEmsSheet } from "@/lib/ft-ems-sheet";
import { FT_EMS_MONTHS, FT_EMS_SUMMARY_ROWS } from "@/lib/ft-ems-config";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { btnGhostSm } from "@/components/admin/button-styles";

/** Percentages 0–100 per row x month, or null where the sheet cell is empty. */
type Summary = (number | null)[][];

const fmt = (v: number) => `${v.toFixed(2)}%`;

function average(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v != null);
  return present.length ? present.reduce((a, b) => a + b, 0) / present.length : null;
}

function cellClass(value: number | null, target: number | null) {
  if (value == null || target == null) return "";
  return value >= target ? "bg-primary-500/15 font-semibold text-primary-600" : "bg-danger/10 font-semibold text-danger";
}

export default async function FtEmsSummaryPage() {
  await requirePageAccess("ftems");
  const res = await callFtEmsSheet<Summary>({ action: "summary" });

  return (
    <div>
      <PageHead
        title="สรุป FT EMS REH 2570"
        subtitle="อ่านจาก Google Sheet — เขียวเมื่อผ่านเป้า แดงเมื่อไม่ผ่าน"
        action={
          <Link href="/admin/ft-ems" className={`${btnGhostSm} flex items-center gap-1.5`}>
            <Pencil size={14} /> บันทึกข้อมูล
          </Link>
        }
      />

      {!res.ok ? (
        <p role="alert" className="rounded-[10px] bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{res.error}</p>
      ) : (
        <AdminCard className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="border-b border-border bg-surface-2 text-xs font-semibold text-text-muted">
              <tr>
                <th className="px-3 py-3 text-left">ลำดับ</th>
                <th className="px-3 py-3 text-left">ตัวชี้วัด</th>
                <th className="px-3 py-3 text-center">เป้าหมาย</th>
                <th className="px-3 py-3 text-left">ผู้รับผิดชอบ</th>
                {FT_EMS_MONTHS.map((m) => (
                  <th key={m} className="px-2 py-3 text-center">{m}</th>
                ))}
                <th className="px-3 py-3 text-center">รวม (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {FT_EMS_SUMMARY_ROWS.map((row, r) => {
                const values = FT_EMS_MONTHS.map((_, m) => res.data[r]?.[m] ?? null);
                const total = average(values);
                return (
                  <tr key={row.label}>
                    <td className="px-3 py-2.5 text-text-muted">{r + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-text">{row.label}</td>
                    <td className="px-3 py-2.5 text-center text-text-muted">{row.target != null ? `≥ ${row.target}%` : ""}</td>
                    <td className="px-3 py-2.5 text-text-muted">{row.owner}</td>
                    {values.map((v, m) => (
                      <td key={m} className={`px-2 py-2.5 text-center ${cellClass(v, row.target)}`}>
                        {v == null ? "" : fmt(v)}
                      </td>
                    ))}
                    <td className={`px-3 py-2.5 text-center ${cellClass(total, row.target)}`}>{total == null ? "" : fmt(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminCard>
      )}
    </div>
  );
}

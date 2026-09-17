"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { uploadUrl } from "@/lib/upload";
import { formatDateTh } from "@/lib/format";
import { MEDICINE_CLASSIFICATION_META, MEDICINE_STOCK_STATE_META, type MedicineStockState } from "@/lib/medicine-meta";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { AdminCard } from "@/components/admin/admin-card";
import { inputClass } from "@/components/admin/form-field";
import { btnDangerSm, btnGhostSm } from "@/components/admin/button-styles";
import { deleteMedicine } from "./actions";

type MedicineRow = {
  id: number;
  code: string;
  generic_name: string;
  trade_name: string | null;
  unit: string;
  classification: keyof typeof MEDICINE_CLASSIFICATION_META;
  photo: string | null;
  category: { name: string } | null;
  total_qty: number;
  nearest_expiry: Date | null;
  state: MedicineStockState;
};

type SortKey = "name" | "code" | "category" | "state";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "ยา" },
  { key: "code", label: "รหัสยา" },
  { key: "category", label: "หมวดหมู่" },
  { key: "state", label: "สถานะสต๊อก" },
];

function sortValue(item: MedicineRow, key: SortKey): string {
  switch (key) {
    case "name":
      return item.generic_name;
    case "code":
      return item.code;
    case "category":
      return item.category?.name ?? "";
    case "state":
      return MEDICINE_STOCK_STATE_META[item.state].label;
  }
}

export function MedicineTable({ items }: { items: MedicineRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = items;
    if (q) {
      rows = rows.filter((item) =>
        [item.generic_name, item.trade_name ?? "", item.code, item.category?.name ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const cmp = sortValue(a, sortKey).localeCompare(sortValue(b, sortKey), "th");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
  }, [items, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหายา..."
            className={`${inputClass} pl-8`}
          />
        </div>
        <span className="text-xs text-text-muted">พบ {filtered.length.toLocaleString("th-TH")} รายการ</span>
      </div>

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} className="px-5 py-3">
                  <button type="button" onClick={() => toggleSort(col.key)} className="inline-flex items-center gap-1 hover:text-text">
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </button>
                </th>
              ))}
              <th className="px-5 py-3">คงเหลือ</th>
              <th className="px-5 py-3">ควบคุม</th>
              <th className="px-5 py-3">หมดอายุใกล้สุด</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((item) => {
              const state = MEDICINE_STOCK_STATE_META[item.state];
              const classification = MEDICINE_CLASSIFICATION_META[item.classification];
              return (
                <tr key={item.id}>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                        <Image src={uploadUrl(item.photo)} alt="" fill sizes="40px" className="object-cover" />
                      </div>
                      <div>
                        <div className="font-semibold text-text">{item.generic_name}</div>
                        {item.trade_name && <div className="text-xs text-text-muted">{item.trade_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-text-muted">{item.code}</td>
                  <td className="px-5 py-2.5 text-text-muted">{item.category?.name ?? "-"}</td>
                  <td className="px-5 py-2.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${state.className}`}>{state.label}</span>
                  </td>
                  <td className="px-5 py-2.5 text-text-muted">{item.total_qty.toLocaleString("th-TH")} {item.unit}</td>
                  <td className="px-5 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${classification.className}`}>{classification.label}</span>
                  </td>
                  <td className="px-5 py-2.5 text-text-muted">{item.nearest_expiry ? formatDateTh(item.nearest_expiry) : "-"}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <Link href={`/admin/medicine/${item.id}`} className={btnGhostSm}>จัดการล็อต</Link>
                      <Link href={`/admin/medicine/${item.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                      <form action={deleteMedicine}>
                        <input type="hidden" name="id" value={item.id} />
                        <ConfirmSubmitButton confirmText={`ลบยา "${item.generic_name}" ?`} className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-text-muted">
                  {items.length === 0 ? "ยังไม่มีรายการยา" : "ไม่พบรายการที่ค้นหา"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </>
  );
}

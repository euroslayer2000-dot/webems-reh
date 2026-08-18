"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { uploadUrl } from "@/lib/upload";
import { EQUIPMENT_STATUS_META } from "@/lib/equipment-status";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { EquipmentQrButton } from "@/components/admin/equipment-qr-button";
import { EquipmentDetailButton } from "@/components/admin/equipment-detail-button";
import { BulkQrPrintButton } from "@/components/admin/bulk-qr-print-button";
import { AdminCard } from "@/components/admin/admin-card";
import { inputClass } from "@/components/admin/form-field";
import { btnDangerSm, btnGhostSm } from "@/components/admin/button-styles";
import { deleteEquipment } from "./actions";

type EquipmentRow = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  location: string | null;
  status: keyof typeof EQUIPMENT_STATUS_META;
  photo: string | null;
  photo2: string | null;
  photo3: string | null;
  brand: string | null;
  unit: string;
  purchase_date: Date | null;
  purchase_price: unknown;
  warranty_document: string | null;
  receipt_document: string | null;
  category: { name: string } | null;
};

type SortKey = "name" | "code" | "category" | "location" | "status";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "ครุภัณฑ์" },
  { key: "code", label: "เลขครุภัณฑ์" },
  { key: "category", label: "หมวดหมู่" },
  { key: "location", label: "สถานที่" },
  { key: "status", label: "สถานะ" },
];

function sortValue(item: EquipmentRow, key: SortKey): string {
  switch (key) {
    case "name":
      return item.name;
    case "code":
      return item.code;
    case "category":
      return item.category?.name ?? "";
    case "location":
      return item.location ?? "";
    case "status":
      return EQUIPMENT_STATUS_META[item.status].label;
  }
}

export function EquipmentTable({ items, baseUrl }: { items: EquipmentRow[]; baseUrl: string }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = items;
    if (q) {
      rows = rows.filter((item) =>
        [item.name, item.code, item.category?.name ?? "", item.location ?? "", EQUIPMENT_STATUS_META[item.status].label]
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

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allFilteredSelected = filtered.length > 0 && filtered.every((item) => selected.has(item.id));

  function toggleAll() {
    setSelected((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev);
        filtered.forEach((item) => next.delete(item.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((item) => next.add(item.id));
      return next;
    });
  }

  const selectedItems = items
    .filter((item) => selected.has(item.id))
    .map((item) => ({ code: item.code, name: item.name, location: item.location, url: `${baseUrl}/equipment/show/${item.code}` }));

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาครุภัณฑ์..."
            className={`${inputClass} pl-8`}
          />
        </div>
        <span className="text-xs text-text-muted">พบ {filtered.length.toLocaleString("th-TH")} รายการ</span>
        <div className="ml-auto">
          <BulkQrPrintButton items={selectedItems} />
        </div>
      </div>

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="w-10 px-5 py-3">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleAll}
                  aria-label="เลือกทั้งหมด"
                  className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
                />
              </th>
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
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((item) => {
              const status = EQUIPMENT_STATUS_META[item.status];
              return (
                <tr key={item.id}>
                  <td className="px-5 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleRow(item.id)}
                      aria-label={`เลือก ${item.name}`}
                      className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                        <Image src={uploadUrl(item.photo)} alt="" fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="font-semibold text-text">{item.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 font-mono text-text-muted">{item.code}</td>
                  <td className="px-5 py-2.5 text-text-muted">{item.category?.name ?? "-"}</td>
                  <td className="px-5 py-2.5 text-text-muted">{item.location ?? "-"}</td>
                  <td className="px-5 py-2.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <EquipmentQrButton code={item.code} name={item.name} location={item.location} url={`${baseUrl}/equipment/show/${item.code}`} />
                      <EquipmentDetailButton item={item} />
                      <Link href={`/admin/equipment/${item.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                      <form action={deleteEquipment}>
                        <input type="hidden" name="id" value={item.id} />
                        <ConfirmSubmitButton confirmText={`ลบครุภัณฑ์ "${item.name}" ?`} className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-text-muted">
                  {items.length === 0 ? "ยังไม่มีครุภัณฑ์" : "ไม่พบรายการที่ค้นหา"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </>
  );
}

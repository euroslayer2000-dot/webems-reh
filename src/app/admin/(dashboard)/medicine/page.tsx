import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { medicineStockState } from "@/lib/medicine-meta";
import { PageHead } from "@/components/admin/page-head";
import { btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { MedicineTable } from "./medicine-table";

const FILTER_TABS = [
  { key: "all", label: "ยาทั้งหมด" },
  { key: "normal", label: "ปกติ" },
  { key: "low_stock", label: "สต๊อกต่ำ" },
  { key: "near_expiry", label: "ใกล้หมดอายุ" },
  { key: "expired", label: "หมดอายุแล้ว" },
] as const;

export default async function AdminMedicinePage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  await requirePageAccess("medicine");
  const { state: rawState } = await searchParams;
  const activeState = FILTER_TABS.some((t) => t.key === rawState) ? rawState! : "all";

  const allItems = await prisma.medicine.findMany({
    include: { category: true, batches: { select: { quantity_on_hand: true, expiry_date: true } } },
    orderBy: { created_at: "desc" },
  });

  const rows = allItems.map((item) => {
    const total_qty = item.batches.reduce((sum, b) => sum + b.quantity_on_hand, 0);
    const nearestExpiry = item.batches
      .filter((b) => b.quantity_on_hand > 0)
      .sort((a, b) => +a.expiry_date - +b.expiry_date)[0]?.expiry_date ?? null;
    const state = medicineStockState(total_qty, item.min_stock, nearestExpiry);
    return { ...item, total_qty, nearest_expiry: nearestExpiry, state };
  });

  const counts: Record<string, number> = { all: rows.length };
  for (const row of rows) counts[row.state] = (counts[row.state] ?? 0) + 1;

  const items = activeState === "all" ? rows : rows.filter((row) => row.state === activeState);

  return (
    <div>
      <PageHead
        title="จัดการรายการยา"
        action={
          <div className="flex gap-2">
            <Link href="/admin/medicine/export" className={`${btnGhostSm} inline-flex items-center gap-1.5`}>
              <Download size={16} /> ส่งออก Excel/CSV
            </Link>
            <Link href="/admin/medicine/create" className={btnPrimary}>
              <Plus size={16} /> เพิ่มยา
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/admin/medicine" : `/admin/medicine?state=${tab.key}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              activeState === tab.key
                ? "border-transparent bg-[image:var(--grad-primary)] text-white"
                : "border-border text-text-muted hover:bg-bg-soft"
            }`}
          >
            {tab.label} <span className="ml-1 opacity-80">{counts[tab.key] ?? 0}</span>
          </Link>
        ))}
      </div>

      <MedicineTable items={items} />
    </div>
  );
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { medicineStockState, MEDICINE_CLASSIFICATION_META, MEDICINE_STOCK_STATE_META } from "@/lib/medicine-meta";

/** Wraps a CSV field in quotes and escapes internal quotes if it needs it
 * (contains a comma, quote, or newline) — otherwise leaves it bare. */
function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function csvRow(values: string[]): string {
  return values.map(csvField).join(",") + "\r\n";
}

export async function GET() {
  await requirePageAccess("medicine");

  const items = await prisma.medicine.findMany({
    include: { category: true, batches: { select: { quantity_on_hand: true, expiry_date: true } } },
    orderBy: { created_at: "desc" },
  });

  const header = ["รหัสยา", "ชื่อสามัญ", "ชื่อการค้า", "หมวดหมู่", "ประเภทควบคุม", "หน่วยนับ", "คงเหลือรวม", "สต๊อกขั้นต่ำ", "วันหมดอายุใกล้สุด", "สถานะ"];
  let csv = csvRow(header);

  for (const item of items) {
    const total_qty = item.batches.reduce((sum, b) => sum + b.quantity_on_hand, 0);
    const nearestExpiry = item.batches
      .filter((b) => b.quantity_on_hand > 0)
      .sort((a, b) => +a.expiry_date - +b.expiry_date)[0]?.expiry_date ?? null;
    const state = medicineStockState(total_qty, item.min_stock, nearestExpiry);

    csv += csvRow([
      item.code,
      item.generic_name,
      item.trade_name ?? "",
      item.category?.name ?? "",
      MEDICINE_CLASSIFICATION_META[item.classification].label,
      item.unit,
      String(total_qty),
      String(item.min_stock),
      nearestExpiry ? formatDateTh(nearestExpiry) : "",
      MEDICINE_STOCK_STATE_META[state].label,
    ]);
  }

  // UTF-8 BOM so Excel on Windows renders Thai text correctly instead of mojibake.
  const bom = "﻿";
  const filename = `medicine-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

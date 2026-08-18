import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { EQUIPMENT_STATUS_META } from "@/lib/equipment-status";

/** Wraps a CSV field in quotes and escapes internal quotes if it needs it
 * (contains a comma, quote, or newline) — otherwise leaves it bare. */
function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function csvRow(values: string[]): string {
  return values.map(csvField).join(",") + "\r\n";
}

export async function GET(request: NextRequest) {
  await requirePageAccess("equipment");

  const status = request.nextUrl.searchParams.get("status");
  const where = status && status in EQUIPMENT_STATUS_META ? { status: status as keyof typeof EQUIPMENT_STATUS_META } : {};

  const items = await prisma.equipment.findMany({
    where,
    include: { category: true },
    orderBy: { created_at: "desc" },
  });

  const header = ["เลขครุภัณฑ์", "ชื่อ", "หมวดหมู่", "สถานะ", "สถานที่", "ยี่ห้อ", "หน่วยนับ", "วันที่จัดซื้อ", "ราคาที่จัดซื้อ (บาท)"];
  let csv = csvRow(header);

  for (const item of items) {
    csv += csvRow([
      item.code,
      item.name,
      item.category?.name ?? "",
      EQUIPMENT_STATUS_META[item.status].label,
      item.location ?? "",
      item.brand ?? "",
      item.unit,
      item.purchase_date ? formatDateTh(item.purchase_date) : "",
      item.purchase_price != null ? Number(item.purchase_price).toFixed(2) : "",
    ]);
  }

  // UTF-8 BOM so Excel on Windows renders Thai text correctly instead of mojibake.
  const bom = "﻿";
  const filename = `equipment-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

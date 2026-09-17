import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { periodDateRange, type Period } from "@/lib/equipment-notifications";

function csvField(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function csvRow(values: string[]): string {
  return values.map(csvField).join(",") + "\r\n";
}

export async function GET(request: NextRequest) {
  await requirePageAccess("medicinedispense");

  const period = request.nextUrl.searchParams.get("period") as Period | null;
  const medicineId = request.nextUrl.searchParams.get("medicine_id");
  const station = request.nextUrl.searchParams.get("station");

  const periodRange = period ? periodDateRange(period) : null;
  const where = {
    ...(periodRange ? { used_at: { gte: periodRange.gte, lte: periodRange.lte } } : {}),
    ...(medicineId ? { batch: { medicine_id: Number(medicineId) } } : {}),
    ...(station ? { station: { contains: station } } : {}),
  };

  const dispenses = await prisma.medicineDispense.findMany({
    where,
    include: { batch: { include: { medicine: true } }, patient_report: true },
    orderBy: { used_at: "desc" },
  });

  const header = ["วันเวลา", "ยา", "ล็อต", "จำนวน", "หน่วยนับ", "ผู้ใช้ยา", "สถานี/หน่วย", "เคสผู้ป่วย", "พยาน", "หมายเหตุ"];
  let csv = csvRow(header);

  for (const d of dispenses) {
    csv += csvRow([
      formatDateTh(d.used_at, true),
      d.batch.medicine.generic_name,
      d.batch.lot_no,
      String(d.qty),
      d.batch.medicine.unit,
      d.used_by,
      d.station ?? "",
      d.patient_report ? formatDateTh(d.patient_report.report_date) : "",
      d.witness_name ?? "",
      d.note ?? "",
    ]);
  }

  const bom = "﻿";
  const filename = `medicine-dispense-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

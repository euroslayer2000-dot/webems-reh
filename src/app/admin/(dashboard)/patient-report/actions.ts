"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActionAccess } from "@/lib/admin-auth";
import { redirectWithFlash } from "@/lib/flash-redirect";

const patientReportSchema = z.object({
  report_date: z.string().min(1, "กรุณาระบุวันที่"),
  patient_count: z.coerce.number().int("ต้องเป็นจำนวนเต็ม").min(0, "ต้องไม่ติดลบ"),
  emergency_count: z.coerce.number().int("ต้องเป็นจำนวนเต็ม").min(0, "ต้องไม่ติดลบ"),
  traffic_injury_count: z.coerce.number().int("ต้องเป็นจำนวนเต็ม").min(0, "ต้องไม่ติดลบ"),
  general_injury_count: z.coerce.number().int("ต้องเป็นจำนวนเต็ม").min(0, "ต้องไม่ติดลบ"),
  note: z.string().optional(),
});

export type PatientReportFormState = {
  ok: boolean;
  errors?: Partial<Record<keyof z.infer<typeof patientReportSchema>, string>>;
};

function parse(formData: FormData) {
  return patientReportSchema.safeParse({
    report_date: formData.get("report_date"),
    patient_count: formData.get("patient_count") || 0,
    emergency_count: formData.get("emergency_count") || 0,
    traffic_injury_count: formData.get("traffic_injury_count") || 0,
    general_injury_count: formData.get("general_injury_count") || 0,
    note: formData.get("note") || undefined,
  });
}

function toErrors(error: z.ZodError<z.infer<typeof patientReportSchema>>): PatientReportFormState["errors"] {
  const errors: NonNullable<PatientReportFormState["errors"]> = {};
  for (const issue of error.issues) errors[issue.path[0] as keyof z.infer<typeof patientReportSchema>] = issue.message;
  return errors;
}

function buildData(parsed: z.infer<typeof patientReportSchema>) {
  return {
    report_date: new Date(parsed.report_date),
    patient_count: parsed.patient_count,
    emergency_count: parsed.emergency_count,
    traffic_injury_count: parsed.traffic_injury_count,
    general_injury_count: parsed.general_injury_count,
    note: parsed.note || null,
  };
}

export async function createPatientReport(_prev: PatientReportFormState, formData: FormData): Promise<PatientReportFormState> {
  await requireActionAccess("patientreport");
  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const reportDate = new Date(parsed.data.report_date);
  const existing = await prisma.patientReport.findUnique({ where: { report_date: reportDate } });
  if (existing) {
    return { ok: false, errors: { report_date: "มีข้อมูลของวันที่นี้อยู่แล้ว กรุณาแก้ไขข้อมูลเดิมแทน" } };
  }

  await prisma.patientReport.create({ data: buildData(parsed.data) });

  redirectWithFlash("/admin/patient-report", "เพิ่มข้อมูลรับแจ้งเหตุเรียบร้อยแล้ว");
}

export async function updatePatientReport(id: number, _prev: PatientReportFormState, formData: FormData): Promise<PatientReportFormState> {
  await requireActionAccess("patientreport");
  await prisma.patientReport.findUniqueOrThrow({ where: { id } });

  const parsed = parse(formData);
  if (!parsed.success) return { ok: false, errors: toErrors(parsed.error) };

  const reportDate = new Date(parsed.data.report_date);
  const existing = await prisma.patientReport.findUnique({ where: { report_date: reportDate } });
  if (existing && existing.id !== id) {
    return { ok: false, errors: { report_date: "มีข้อมูลของวันที่นี้อยู่แล้ว กรุณาแก้ไขข้อมูลเดิมแทน" } };
  }

  await prisma.patientReport.update({ where: { id }, data: buildData(parsed.data) });

  redirectWithFlash("/admin/patient-report", "บันทึกข้อมูลรับแจ้งเหตุเรียบร้อยแล้ว");
}

export async function deletePatientReport(formData: FormData): Promise<void> {
  await requireActionAccess("patientreport");
  const id = Number(formData.get("id"));
  await prisma.patientReport.delete({ where: { id } });

  redirectWithFlash("/admin/patient-report", "ลบข้อมูลรับแจ้งเหตุเรียบร้อยแล้ว");
}

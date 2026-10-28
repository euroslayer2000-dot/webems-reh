"use server";

import { z } from "zod";
import { requireActionAccess } from "@/lib/admin-auth";
import { callFtEmsSheet } from "@/lib/ft-ems-sheet";
import {
  FT_EMS_INDICATORS,
  FT_EMS_TRACKS,
  type FtEmsIndicatorKey,
  type MonthlyCounts,
} from "@/lib/ft-ems-config";

const monthSchema = z.coerce.number().int().min(0).max(11);
const trackSchema = z.enum(FT_EMS_TRACKS);
const indicatorSchema = z.enum(FT_EMS_INDICATORS.map((i) => i.key) as [FtEmsIndicatorKey, ...FtEmsIndicatorKey[]]);

/** Whole numbers only — rejects dates, text, decimals and negatives. */
const count = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `กรุณากรอก ${label}`)
    .regex(/^\d+$/, `${label} ต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป`)
    .max(7, `${label} มีค่ามากเกินไป`)
    .transform(Number);

const monthlySchema = z.object({
  month: monthSchema,
  track: trackSchema,
  walkin: count("Walk in"),
  als: count("ALS"),
  bls: count("BLS"),
  emr: count("EMR"),
});

const indicatorFormSchema = z.object({
  month: monthSchema,
  indicator: indicatorSchema,
  percent: z
    .string()
    .trim()
    .min(1, "กรุณากรอกร้อยละ")
    .regex(/^\d{1,3}(\.\d{1,2})?$/, "ร้อยละต้องเป็นตัวเลข 0–100 (ทศนิยมไม่เกิน 2 ตำแหน่ง)")
    .transform(Number)
    .refine((n) => n <= 100, "ร้อยละต้องไม่เกิน 100"),
});

export type FtEmsFormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

function toErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) errors[String(issue.path[0])] ??= issue.message;
  return errors;
}

export async function loadMonthly(month: number, track: string): Promise<MonthlyCounts | null | { error: string }> {
  await requireActionAccess("ftems");
  const m = monthSchema.safeParse(month);
  const t = trackSchema.safeParse(track);
  if (!m.success || !t.success) return { error: "ข้อมูลไม่ถูกต้อง" };
  const res = await callFtEmsSheet<MonthlyCounts | null>({ action: "getMonthly", month: m.data, track: t.data });
  return res.ok ? res.data : { error: res.error };
}

export async function saveMonthly(_prev: FtEmsFormState, formData: FormData): Promise<FtEmsFormState> {
  await requireActionAccess("ftems");
  const parsed = monthlySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "กรุณาตรวจสอบข้อมูลที่กรอก", errors: toErrors(parsed.error) };

  const res = await callFtEmsSheet<null>({ action: "saveMonthly", ...parsed.data });
  if (!res.ok) return { ok: false, message: res.error };
  return { ok: true, message: "บันทึกลง Google Sheet เรียบร้อยแล้ว" };
}

export async function loadIndicator(month: number, indicator: string): Promise<number | null | { error: string }> {
  await requireActionAccess("ftems");
  const m = monthSchema.safeParse(month);
  const i = indicatorSchema.safeParse(indicator);
  if (!m.success || !i.success) return { error: "ข้อมูลไม่ถูกต้อง" };
  const res = await callFtEmsSheet<number | null>({ action: "getIndicator", month: m.data, indicator: i.data });
  return res.ok ? res.data : { error: res.error };
}

export async function saveIndicator(_prev: FtEmsFormState, formData: FormData): Promise<FtEmsFormState> {
  await requireActionAccess("ftems");
  const parsed = indicatorFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "กรุณาตรวจสอบข้อมูลที่กรอก", errors: toErrors(parsed.error) };

  const res = await callFtEmsSheet<null>({ action: "saveIndicator", ...parsed.data });
  if (!res.ok) return { ok: false, message: res.error };
  return { ok: true, message: "บันทึกลง Google Sheet เรียบร้อยแล้ว" };
}

/** FT EMS REH 2570 (fiscal year Oct–Sep). Shared by the input form, the summary
 * page and the server actions; the Apps Script in apps-script/ft-ems.gs mirrors
 * the month/track order. */

export const FT_EMS_MONTHS = [
  "ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค.",
  "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.",
] as const;

export const FT_EMS_TRACKS = ["STEMI", "STROKE", "SEPSIS", "HIP", "OB-GYN", "PED", "SHI", "TRAUMA"] as const;

export const FT_EMS_INDICATORS = [
  { key: "ROSC", label: "อัตราการ CPR ที่มี ROSC ในผู้ป่วย OHCA" },
  { key: "T10", label: "ร้อยละการเข้าถึงผู้ป่วยของหน่วย EMS ภายใน 10 นาที หลังแจ้งเหตุ" },
  { key: "T8", label: "ร้อยละการเข้าถึงผู้ป่วยของหน่วย EMS ภายใน 8 นาที" },
  { key: "T2", label: "ร้อยละการเข้าถึงผู้ป่วยของหน่วย EMS ภายใน 2 นาที" },
] as const;

export type FtEmsTrack = (typeof FT_EMS_TRACKS)[number];
export type FtEmsIndicatorKey = (typeof FT_EMS_INDICATORS)[number]["key"];

/** The 12 rows of the summary table, in sheet order. `target` is a percentage. */
export const FT_EMS_SUMMARY_ROWS: { label: string; target: number | null; owner: string }[] = [
  { label: "STEMI", target: 60, owner: "ธนิษฐา" },
  { label: "STROKE", target: 60, owner: "ณภัทร" },
  { label: "SEPSIS", target: null, owner: "ละมัย" },
  { label: "HIP", target: null, owner: "กิตติวรรรณ" },
  { label: "OB-GYN", target: null, owner: "ฉัตรสุดา" },
  { label: "PED", target: null, owner: "ฉัตรสุดา" },
  { label: "SHI", target: null, owner: "ประพรรณธิดา" },
  { label: "TRAUMA", target: 80, owner: "ประพรรณธิดา" },
  { label: FT_EMS_INDICATORS[0].label, target: 25, owner: "กิตติวรรรณ" },
  { label: FT_EMS_INDICATORS[1].label, target: null, owner: "ภาลินี" },
  { label: FT_EMS_INDICATORS[2].label, target: null, owner: "ภาลินี" },
  { label: FT_EMS_INDICATORS[3].label, target: null, owner: "ภาลินี" },
];

export type MonthlyCounts = { walkin: number; als: number; bls: number; emr: number };

export function calcMonthly({ walkin, als, bls, emr }: MonthlyCounts) {
  const ems = als + bls + emr;
  const all = walkin + ems;
  return { ems, all, emsPercent: all > 0 ? (ems / all) * 100 : null };
}

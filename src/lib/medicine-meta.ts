import type { medicine_classification as MedicineClassification, medicine_storage_condition as MedicineStorageCondition } from "@prisma/client";

export const MEDICINE_CLASSIFICATION_META: Record<MedicineClassification, { label: string; className: string; needsWitness: boolean }> = {
  general: { label: "ทั่วไป", className: "bg-bg-soft text-text-muted", needsWitness: false },
  dangerous: { label: "ยาอันตราย", className: "bg-warning/15 text-warning", needsWitness: false },
  special_control: { label: "ยาควบคุมพิเศษ", className: "bg-danger/15 text-danger", needsWitness: true },
  psychotropic: { label: "วัตถุออกฤทธิ์ต่อจิตและประสาท", className: "bg-danger/15 text-danger", needsWitness: true },
  narcotic: { label: "ยาเสพติด", className: "bg-danger/15 text-danger", needsWitness: true },
};

export const MEDICINE_STORAGE_META: Record<MedicineStorageCondition, { label: string }> = {
  room_temp: { label: "อุณหภูมิห้อง" },
  refrigerated: { label: "แช่เย็น 2-8°C" },
  protect_light: { label: "เก็บให้พ้นแสง" },
};

export function medicineNeedsWitness(classification: MedicineClassification): boolean {
  return MEDICINE_CLASSIFICATION_META[classification].needsWitness;
}

export type MedicineStockState = "expired" | "near_expiry" | "low_stock" | "normal";

export const MEDICINE_STOCK_STATE_META: Record<MedicineStockState, { label: string; className: string }> = {
  expired: { label: "หมดอายุแล้ว", className: "bg-danger/15 text-danger" },
  near_expiry: { label: "ใกล้หมดอายุ", className: "bg-warning/15 text-warning" },
  low_stock: { label: "สต๊อกต่ำ", className: "bg-info/15 text-info" },
  normal: { label: "ปกติ", className: "bg-primary-50 text-primary-700" },
};

/** Derives a single display state for a medicine from its aggregated batch
 * data — priority expired > near_expiry > low_stock > normal, matching the
 * MedicineStockStateDoughnutChart's buckets. `nearestExpiry` should be the
 * soonest expiry_date among batches that still have quantity_on_hand > 0. */
export function medicineStockState(
  totalQty: number,
  minStock: number,
  nearestExpiry: Date | null,
  expiryWindowDays = 90
): MedicineStockState {
  if (nearestExpiry) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(nearestExpiry);
    expiry.setHours(0, 0, 0, 0);
    const diffDays = Math.round((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays < 0) return "expired";
    if (diffDays <= expiryWindowDays) return "near_expiry";
  }
  if (minStock > 0 && totalQty <= minStock) return "low_stock";
  return "normal";
}

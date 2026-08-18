import type { equipment_status as EquipmentStatus } from "@prisma/client";

export const EQUIPMENT_STATUS_META: Record<EquipmentStatus, { label: string; className: string }> = {
  available: { label: "พร้อมใช้งาน", className: "bg-primary-50 text-primary-700" },
  borrowed: { label: "ถูกยืม", className: "bg-warning/15 text-warning" },
  damaged: { label: "ชำรุด", className: "bg-danger/15 text-danger" },
  maintenance: { label: "ซ่อมบำรุง", className: "bg-info/15 text-info" },
  disposed: { label: "จำหน่ายแล้ว", className: "bg-bg-soft text-text-muted" },
};

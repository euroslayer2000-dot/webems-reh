import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Bell,
  ClipboardCheck,
  ClipboardList,
  FileDown,
  GraduationCap,
  Images,
  LayoutGrid,
  MapPin,
  Megaphone,
  MessageCircle,
  Network,
  Newspaper,
  Package,
  Pill,
  Settings,
  Tags,
  UserCog,
  Users,
} from "lucide-react";

export type NavLeaf = {
  module: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: "notification" | "medicineNotification" | "contact";
};

export type NavEntry =
  | NavLeaf
  | { kind: "group"; label: string; icon: LucideIcon; badge?: "notification" | "medicineNotification"; items: NavLeaf[] };

/** Mirrors partials/admin-sidebar.blade.php: a flat "จัดการเนื้อหา" section, a
 * collapsible "ครุภัณฑ์" sub-group within it, then a "ระบบ" section. */
export const NAV_DASHBOARD: NavLeaf = { module: "dashboard", label: "แดชบอร์ด", href: "/admin/dashboard", icon: LayoutGrid };

export const NAV_CONTENT: NavEntry[] = [
  { module: "news", label: "ข่าวประชาสัมพันธ์", href: "/admin/news", icon: Newspaper },
  { module: "category", label: "หมวดหมู่", href: "/admin/category", icon: Tags },
  { module: "structure", label: "โครงสร้างหน่วยงาน", href: "/admin/structure", icon: Network },
  { module: "personnel", label: "บุคลากร", href: "/admin/personnel", icon: Users },
  { module: "station", label: "จุดหน่วยกู้ชีพ (แผนที่)", href: "/admin/station", icon: MapPin },
  { module: "gallery", label: "แกลเลอรี", href: "/admin/gallery", icon: Images },
  { module: "course", label: "หลักสูตรการเรียน", href: "/admin/course", icon: GraduationCap },
  { module: "patientreport", label: "ข้อมูลรับแจ้งเหตุ", href: "/admin/patient-report", icon: ClipboardList },
  { module: "download", label: "เอกสารดาวน์โหลด", href: "/admin/download", icon: FileDown },
  {
    kind: "group",
    label: "ครุภัณฑ์",
    icon: Package,
    badge: "notification",
    items: [
      { module: "equipment", label: "หน้าแรก", href: "/admin/equipment/dashboard", icon: LayoutGrid },
      { module: "equipment", label: "ครุภัณฑ์ทั้งหมด", href: "/admin/equipment", icon: Package },
      { module: "equipmentcategory", label: "หมวดหมู่ครุภัณฑ์", href: "/admin/equipment-category", icon: Tags },
      { module: "equipmentborrow", label: "ยืม-คืนครุภัณฑ์", href: "/admin/equipment-borrow", icon: ArrowLeftRight },
      { module: "equipment", label: "ตรวจนับครุภัณฑ์", href: "/admin/equipment-stock-take", icon: ClipboardCheck },
      { module: "notification", label: "การแจ้งเตือน", href: "/admin/notification", icon: Bell, badge: "notification" },
    ],
  },
  {
    kind: "group",
    label: "คลังยา",
    icon: Pill,
    badge: "medicineNotification",
    items: [
      { module: "medicine", label: "หน้าแรก", href: "/admin/medicine/dashboard", icon: LayoutGrid },
      { module: "medicine", label: "รายการยาทั้งหมด", href: "/admin/medicine", icon: Pill },
      { module: "medicinecategory", label: "หมวดหมู่ยา", href: "/admin/medicine-category", icon: Tags },
      { module: "medicinedispense", label: "จ่ายยา / ประวัติการใช้", href: "/admin/medicine-dispense", icon: ArrowLeftRight },
      { module: "medicine", label: "ตรวจเช็คสต๊อกยา", href: "/admin/medicine-checklist", icon: ClipboardCheck },
    ],
  },
  { module: "banner", label: "เพิ่มรูปภาพหน้าหลัก", href: "/admin/banner", icon: Images },
  { module: "banner", label: "ป๊อปอัพหน้าเว็บ", href: "/admin/popup-banner", icon: Megaphone },
];

export const NAV_SYSTEM: NavLeaf[] = [
  { module: "contact", label: "ข้อความติดต่อ", href: "/admin/contact", icon: MessageCircle, badge: "contact" },
  { module: "user", label: "ผู้ใช้งานระบบ", href: "/admin/user", icon: UserCog },
  { module: "setting", label: "ตั้งค่าเว็บไซต์", href: "/admin/setting", icon: Settings },
];

export function isLeaf(entry: NavEntry): entry is NavLeaf {
  return !("kind" in entry);
}

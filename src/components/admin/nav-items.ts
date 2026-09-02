import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Bell,
  ClipboardCheck,
  FileDown,
  Images,
  LayoutGrid,
  MapPin,
  MessageCircle,
  Network,
  Newspaper,
  Package,
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
  badge?: "notification" | "contact";
};

export type NavEntry =
  | NavLeaf
  | { kind: "group"; label: string; icon: LucideIcon; badge?: "notification"; items: NavLeaf[] };

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
  { module: "banner", label: "เพิ่มรูปภาพหน้าหลัก", href: "/admin/banner", icon: Images },
];

export const NAV_SYSTEM: NavLeaf[] = [
  { module: "contact", label: "ข้อความติดต่อ", href: "/admin/contact", icon: MessageCircle, badge: "contact" },
  { module: "user", label: "ผู้ใช้งานระบบ", href: "/admin/user", icon: UserCog },
  { module: "setting", label: "ตั้งค่าเว็บไซต์", href: "/admin/setting", icon: Settings },
];

export function isLeaf(entry: NavEntry): entry is NavLeaf {
  return !("kind" in entry);
}

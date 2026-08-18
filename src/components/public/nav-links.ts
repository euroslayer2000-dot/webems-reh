export type NavLink = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const NAV_LINKS: NavLink[] = [
  { label: "หน้าแรก", href: "/" },
  {
    label: "เกี่ยวกับเรา",
    href: "/about/vision",
    children: [
      { label: "วิสัยทัศน์และพันธกิจ", href: "/about/vision" },
      { label: "โครงสร้างองค์กร", href: "/personnel/structure" },
      { label: "ประวัติความเป็นมา", href: "/about/history" },
    ],
  },
  {
    label: "ข่าวประชาสัมพันธ์",
    href: "/news",
    children: [
      { label: "ข่าวประชาสัมพันธ์", href: "/news" },
      { label: "แกลเลอรี", href: "/gallery" },
    ],
  },
  {
    label: "บุคลากร",
    href: "/personnel",
    children: [
      { label: "โครงสร้างหน่วยงาน", href: "/personnel/structure" },
      { label: "ทำเนียบบุคลากร", href: "/personnel" },
    ],
  },
  { label: "แผนที่หน่วย", href: "/stations" },
  { label: "ดาวน์โหลด", href: "/download" },
  { label: "ติดต่อ", href: "/contact" },
];

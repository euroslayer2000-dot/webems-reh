import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CalendarClock,
  Clock,
  Download,
  FileEdit,
  Images,
  Mail,
  MessageCircle,
  Newspaper,
  Plus,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { formatDateTh, strExcerpt } from "@/lib/format";
import { uploadUrl } from "@/lib/upload";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard, AdminCardBody, AdminCardHead } from "@/components/admin/admin-card";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { btnGhostSm, btnPrimary } from "@/components/admin/button-styles";

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = session!.user.role;
  const showContacts = can(role, "contact");
  const showEquipment = can(role, "equipment");
  const showEquipmentBorrow = can(role, "equipmentborrow");
  const showGallery = can(role, "gallery");
  const showBanner = can(role, "banner");

  const maintenanceDueSoonCutoff = new Date();
  maintenanceDueSoonCutoff.setDate(maintenanceDueSoonCutoff.getDate() + 7);

  const [
    newsTotal,
    newsPublished,
    personnelCount,
    downloadSum,
    contactsTotal,
    contactsUnread,
    recentNews,
    recentContacts,
    equipmentCount,
    galleryCount,
    activeBannerCount,
    overdueLoans,
    maintenanceDueSoon,
  ] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { status: "published" } }),
    prisma.personnel.count({ where: { is_active: true } }),
    prisma.download.aggregate({ _sum: { download_count: true } }),
    showContacts ? prisma.contact.count() : 0,
    showContacts ? prisma.contact.count({ where: { is_read: false } }) : 0,
    prisma.news.findMany({ orderBy: { created_at: "desc" }, take: 6 }),
    showContacts ? prisma.contact.findMany({ orderBy: { created_at: "desc" }, take: 5 }) : [],
    showEquipment ? prisma.equipment.count() : 0,
    showGallery ? prisma.gallery.count() : 0,
    showBanner ? prisma.banner.count({ where: { is_active: true } }) : 0,
    showEquipmentBorrow ? prisma.equipmentBorrow.count({ where: { return_date: null, due_date: { lt: new Date() } } }) : 0,
    showEquipment
      ? prisma.equipmentMaintenanceSchedule.count({ where: { completed_date: null, scheduled_date: { lte: maintenanceDueSoonCutoff } } })
      : 0,
  ]);

  const newsDraft = newsTotal - newsPublished;

  const actionItems = [
    showEquipmentBorrow && overdueLoans > 0
      ? { icon: AlertTriangle, label: `ครุภัณฑ์เกินกำหนดคืน ${overdueLoans} รายการ`, href: "/admin/equipment-borrow" }
      : null,
    showEquipment && maintenanceDueSoon > 0
      ? { icon: CalendarClock, label: `งานบำรุงรักษาใกล้ถึงกำหนด ${maintenanceDueSoon} รายการ`, href: "/admin/equipment/dashboard" }
      : null,
    showContacts && contactsUnread > 0
      ? { icon: MessageCircle, label: `ข้อความติดต่อยังไม่อ่าน ${contactsUnread} รายการ`, href: "/admin/contact" }
      : null,
    newsDraft > 0 ? { icon: FileEdit, label: `ข่าวที่ยังเป็นแบบร่าง ${newsDraft} รายการ`, href: "/admin/news" } : null,
  ].filter((item): item is { icon: typeof AlertTriangle; label: string; href: string } => item !== null);

  return (
    <div>
      <PageHead
        title="แดชบอร์ด"
        subtitle="ภาพรวมระบบจัดการเว็บไซต์หน่วยกู้ชีพ REH101"
        action={
          <div className="flex gap-2">
            {showEquipment && (
              <Link href="/admin/equipment/dashboard" className={btnGhostSm}>
                ภาพรวมครุภัณฑ์
              </Link>
            )}
            <Link href="/admin/news/create" className={btnPrimary}>
              <Plus size={16} /> เพิ่มข่าวใหม่
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Newspaper}
          value={newsTotal}
          label="ข่าวทั้งหมด"
          color="green"
          href="/admin/news"
          breakdown={[
            { label: "เผยแพร่", value: newsPublished },
            { label: "ร่าง", value: newsDraft },
          ]}
        />
        <StatCard icon={Users} value={personnelCount} label="บุคลากรที่ใช้งาน" color="pink" href="/admin/personnel" />
        <StatCard icon={Download} value={downloadSum._sum.download_count ?? 0} label="ยอดดาวน์โหลดเอกสาร" color="blue" href="/admin/download" />
        {showContacts && (
          <StatCard
            icon={MessageCircle}
            value={contactsTotal}
            label="ข้อความติดต่อ"
            color="orange"
            href="/admin/contact"
            breakdown={[{ label: "ใหม่", value: contactsUnread }]}
          />
        )}
        {showEquipment && <StatCard icon={Boxes} value={equipmentCount} label="ครุภัณฑ์ทั้งหมด" color="green" href="/admin/equipment" />}
        {showGallery && <StatCard icon={Images} value={galleryCount} label="อัลบั้มภาพ" color="pink" href="/admin/gallery" />}
        {showBanner && <StatCard icon={Images} value={activeBannerCount} label="แบนเนอร์ที่แสดงผลอยู่" color="blue" href="/admin/banner" />}
      </div>

      {actionItems.length > 0 && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-warning/30 bg-warning/10 p-5">
          <h2 className="mb-3 text-sm font-bold text-text">งานที่ต้องดำเนินการ</h2>
          <ul className="flex flex-col gap-2">
            {actionItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="flex items-center gap-2 text-sm text-text hover:underline">
                  <item.icon size={15} className="shrink-0 text-warning" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`grid gap-6 ${showContacts ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
        <AdminCard>
          <AdminCardHead
            title={<span className="flex items-center gap-2"><Clock size={16} /> ข่าวล่าสุด</span>}
            action={<Link href="/admin/news" className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-bg-soft">ดูทั้งหมด</Link>}
          />
          <div className="divide-y divide-border">
            {recentNews.map((n) => (
              <Link key={n.id} href={`/admin/news/${n.id}/edit`} className="flex items-center gap-3 px-5 py-3 hover:bg-bg-soft">
                <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                  <Image src={uploadUrl(n.cover_image)} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">{strExcerpt(n.title, 60)}</p>
                  <p className="text-xs text-text-muted">{formatDateTh(n.created_at)}</p>
                </div>
                <StatusBadge active={n.status === "published"} activeLabel="เผยแพร่" inactiveLabel="ร่าง" />
              </Link>
            ))}
            {recentNews.length === 0 && <p className="px-5 py-8 text-center text-sm text-text-muted">ยังไม่มีข่าว</p>}
          </div>
        </AdminCard>

        {showContacts && (
          <AdminCard>
            <AdminCardHead
              title={<span className="flex items-center gap-2"><Mail size={16} /> ข้อความติดต่อล่าสุด</span>}
              action={<Link href="/admin/contact" className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-bg-soft">ดูทั้งหมด</Link>}
            />
            <AdminCardBody className="flex flex-col gap-3">
              {recentContacts.map((c) => (
                <Link key={c.id} href={`/admin/contact/${c.id}`} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-[image:var(--grad-primary)] text-sm font-bold text-white">
                    {c.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-text">
                      {c.name}
                      {!c.is_read && <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">ใหม่</span>}
                    </p>
                    <p className="truncate text-sm text-text-muted">{strExcerpt(c.message, 50)}</p>
                    <p className="text-xs text-text-muted">{formatDateTh(c.created_at, true)}</p>
                  </div>
                </Link>
              ))}
              {recentContacts.length === 0 && <p className="py-8 text-center text-sm text-text-muted">ยังไม่มีข้อความ</p>}
            </AdminCardBody>
          </AdminCard>
        )}
      </div>
    </div>
  );
}

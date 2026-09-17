import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { uploadUrl } from "@/lib/upload";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deleteBanner, moveBanner, toggleBanner } from "../banner/actions";

export default async function AdminPopupBannerPage() {
  await requirePageAccess("banner");
  const banners = await prisma.banner.findMany({ where: { position: "popup" }, orderBy: [{ sort_order: "asc" }, { id: "asc" }] });

  return (
    <div>
      <PageHead
        title="ป๊อปอัพหน้าเว็บ"
        subtitle="รูปภาพที่จะเด้งขึ้นทุกครั้งที่มีคนเข้า/รีเฟรชหน้าเว็บ — แสดงพร้อมกันได้สูงสุด 3 รูปเป็นสไลด์เลื่อนในป๊อปอัพเดียว โดยใช้รูปที่ยัง “แสดงผล” 3 รูปแรกตามลำดับด้านล่าง ปิดเพื่อไม่ให้เด้งขึ้นอีก"
        action={<Link href="/admin/popup-banner/create" className={btnPrimary}><Plus size={16} /> เพิ่มรูปภาพ</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner, i) => {
          const activeSlot = banners.slice(0, i).filter((b) => b.is_active).length;
          return (
          <AdminCard key={banner.id}>
            <div className="relative aspect-video bg-bg-soft">
              <Image src={uploadUrl(banner.image)} alt={banner.title ?? ""} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-text">{banner.title || "-"}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <StatusBadge active={banner.is_active} activeLabel="แสดงผล" inactiveLabel="ปิด" />
                {banner.is_active && activeSlot < 3 && <StatusBadge active activeLabel="กำลังใช้งานอยู่บนเว็บ" inactiveLabel="" />}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <form action={moveBanner}>
                  <input type="hidden" name="id" value={banner.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={i === 0} aria-label="เลื่อนขึ้น" className={`${btnGhostSm} disabled:opacity-30`}>
                    <ChevronUp size={15} />
                  </button>
                </form>
                <form action={moveBanner}>
                  <input type="hidden" name="id" value={banner.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" disabled={i === banners.length - 1} aria-label="เลื่อนลง" className={`${btnGhostSm} disabled:opacity-30`}>
                    <ChevronDown size={15} />
                  </button>
                </form>
                <form action={toggleBanner}>
                  <input type="hidden" name="id" value={banner.id} />
                  <button type="submit" className={btnGhostSm}>
                    {banner.is_active ? "ปิด" : "เปิด"}
                  </button>
                </form>
                <Link href={`/admin/popup-banner/${banner.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                <form action={deleteBanner}>
                  <input type="hidden" name="id" value={banner.id} />
                  <ConfirmSubmitButton confirmText="ลบรูปภาพนี้ ?" className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                </form>
              </div>
            </div>
          </AdminCard>
          );
        })}
        {banners.length === 0 && <p className="col-span-full py-10 text-center text-sm text-text-muted">ยังไม่มีรูปภาพป๊อปอัพ</p>}
      </div>
    </div>
  );
}

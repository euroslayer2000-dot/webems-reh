import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { uploadUrl } from "@/lib/upload";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { btnDangerSm, btnGhostSm } from "@/components/admin/button-styles";
import { deleteBanner, moveBanner, toggleBanner } from "./actions";
import { QuickAddImageButton } from "./quick-add-button";

const MAX_HERO_IMAGES = 5;

export default async function AdminBannerPage() {
  await requirePageAccess("banner");
  const banners = await prisma.banner.findMany({ where: { position: "hero" }, orderBy: [{ sort_order: "asc" }, { id: "asc" }] });
  const atLimit = banners.length >= MAX_HERO_IMAGES;

  return (
    <div>
      <PageHead title="เพิ่มรูปภาพหน้าหลัก" action={atLimit ? null : <QuickAddImageButton />} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner, i) => (
          <AdminCard key={banner.id}>
            <div className="relative aspect-video bg-bg-soft">
              <Image src={uploadUrl(banner.image)} alt={banner.title ?? ""} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-text">{banner.title || "-"}</p>
              <div className="mt-1.5 flex gap-1.5">
                <StatusBadge active={banner.is_active} activeLabel="แสดงผล" inactiveLabel="ซ่อน" />
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
                    {banner.is_active ? "ซ่อน" : "แสดง"}
                  </button>
                </form>
                <Link href={`/admin/banner/${banner.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                <form action={deleteBanner}>
                  <input type="hidden" name="id" value={banner.id} />
                  <ConfirmSubmitButton confirmText="ลบรูปภาพนี้ ?" className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                </form>
              </div>
            </div>
          </AdminCard>
        ))}
        {banners.length === 0 && <p className="col-span-full py-10 text-center text-sm text-text-muted">ยังไม่มีรูปภาพหน้าหลัก</p>}
      </div>
    </div>
  );
}

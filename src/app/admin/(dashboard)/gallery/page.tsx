import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { uploadUrl } from "@/lib/upload";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deleteGallery } from "./actions";

export default async function AdminGalleryPage() {
  await requirePageAccess("gallery");
  const galleries = await prisma.gallery.findMany({ include: { _count: { select: { images: true } } }, orderBy: { id: "desc" } });

  return (
    <div>
      <PageHead
        title="จัดการแกลเลอรี"
        action={
          <Link href="/admin/gallery/create" className={btnPrimary}>
            <Plus size={16} /> สร้างอัลบั้มใหม่
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleries.map((gallery) => (
          <AdminCard key={gallery.id}>
            <div className="relative aspect-video bg-bg-soft">
              <Image src={uploadUrl(gallery.cover_image)} alt={gallery.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-text">{gallery.title}</p>
              <p className="text-xs text-text-muted">{gallery._count.images} ภาพ</p>
              <div className="mt-3 flex gap-1.5">
                <Link href={`/admin/gallery/${gallery.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                <form action={deleteGallery}>
                  <input type="hidden" name="id" value={gallery.id} />
                  <ConfirmSubmitButton confirmText={`ลบอัลบั้ม "${gallery.title}" ?`} className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                </form>
              </div>
            </div>
          </AdminCard>
        ))}
        {galleries.length === 0 && <p className="col-span-full py-10 text-center text-sm text-text-muted">ยังไม่มีอัลบั้ม</p>}
      </div>
    </div>
  );
}

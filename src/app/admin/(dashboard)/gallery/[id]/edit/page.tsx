import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { uploadUrl } from "@/lib/upload";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard, AdminCardHead } from "@/components/admin/admin-card";
import { btnPrimary } from "@/components/admin/button-styles";
import { MultiImageFileInput } from "@/components/admin/multi-image-file-input";
import { GalleryForm } from "../../gallery-form";
import { addGalleryImages, deleteGalleryImage } from "../../actions";

export default async function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("gallery");
  const { id } = await params;
  const galleryId = Number(id);

  const gallery = await prisma.gallery.findUnique({ where: { id: galleryId } });
  if (!gallery) notFound();

  const images = await prisma.galleryImage.findMany({ where: { gallery_id: galleryId }, orderBy: { sort_order: "asc" } });
  const addImagesAction = addGalleryImages.bind(null, galleryId);

  return (
    <div>
      <PageHead title="แก้ไขอัลบั้ม" />
      <GalleryForm gallery={gallery} />

      <div className="mt-8">
        <AdminCard className="mb-6">
          <AdminCardHead title={`รูปภาพในอัลบั้ม (${images.length})`} />
          <form action={addImagesAction} className="flex flex-wrap items-end gap-3 p-5">
            <MultiImageFileInput id="images" name="images" label="เพิ่มรูปภาพ (เลือกได้หลายไฟล์)" />
            <button type="submit" className={btnPrimary}>
              อัปโหลด
            </button>
          </form>
        </AdminCard>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <AdminCard key={image.id}>
              <div className="relative aspect-square bg-bg-soft">
                <Image src={uploadUrl(image.image_path)} alt={image.caption ?? ""} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" />
              </div>
              <form action={deleteGalleryImage} className="p-2">
                <input type="hidden" name="imageId" value={image.id} />
                <input type="hidden" name="galleryId" value={galleryId} />
                <ConfirmSubmitButton confirmText="ลบรูปนี้ ?" className="w-full rounded-lg border border-danger/30 py-1.5 text-xs font-semibold text-danger hover:bg-danger/10">
                  ลบรูปนี้
                </ConfirmSubmitButton>
              </form>
            </AdminCard>
          ))}
          {images.length === 0 && <p className="col-span-full py-6 text-center text-sm text-text-muted">ยังไม่มีรูปภาพในอัลบั้มนี้</p>}
        </div>
      </div>
    </div>
  );
}

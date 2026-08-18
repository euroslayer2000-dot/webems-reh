import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { GalleryForm } from "../gallery-form";

export default async function CreateGalleryPage() {
  await requirePageAccess("gallery");
  return (
    <div>
      <PageHead title="สร้างอัลบั้มใหม่" />
      <GalleryForm gallery={null} />
    </div>
  );
}

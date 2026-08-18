import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { DownloadForm } from "../download-form";

export default async function CreateDownloadPage() {
  await requirePageAccess("download");
  const categories = await prisma.category.findMany({ where: { type: "download" }, orderBy: { name: "asc" } });

  return (
    <div>
      <PageHead title="เพิ่มเอกสาร" />
      <DownloadForm categories={categories} doc={null} />
    </div>
  );
}

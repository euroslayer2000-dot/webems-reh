import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { DownloadForm } from "../../download-form";

export default async function EditDownloadPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("download");
  const { id } = await params;

  const [categories, doc] = await Promise.all([
    prisma.category.findMany({ where: { type: "download" }, orderBy: { name: "asc" } }),
    prisma.download.findUnique({ where: { id: Number(id) } }),
  ]);
  if (!doc) notFound();

  return (
    <div>
      <PageHead title="แก้ไขเอกสาร" />
      <DownloadForm categories={categories} doc={doc} />
    </div>
  );
}

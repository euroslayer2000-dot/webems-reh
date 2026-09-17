import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { BannerForm } from "../../../banner/banner-form";

export default async function EditPopupBannerPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("banner");
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id: Number(id) } });
  if (!banner) notFound();

  return (
    <div>
      <PageHead title="แก้ไขป๊อปอัพ" />
      <BannerForm banner={banner} backHref="/admin/popup-banner" />
    </div>
  );
}

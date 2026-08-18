import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { BannerForm } from "../../banner-form";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("banner");
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id: Number(id) } });
  if (!banner) notFound();

  return (
    <div>
      <PageHead title="แก้ไขแบนเนอร์" />
      <BannerForm banner={banner} />
    </div>
  );
}

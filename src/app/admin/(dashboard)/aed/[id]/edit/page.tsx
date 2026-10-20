import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { AedForm } from "../../aed-form";

export default async function EditAedPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("aed");
  const { id } = await params;
  const aed = await prisma.aedLocation.findUnique({ where: { id: Number(id) } });
  if (!aed) notFound();

  return (
    <div>
      <PageHead title="แก้ไขจุดติดตั้งเครื่อง AED" />
      <AedForm aed={aed} />
    </div>
  );
}

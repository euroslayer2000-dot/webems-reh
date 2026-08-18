import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { StructureForm } from "../../structure-form";

export default async function EditStructurePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("structure");
  const { id } = await params;
  const structure = await prisma.orgStructure.findUnique({ where: { id: Number(id) } });
  if (!structure) notFound();

  return (
    <div>
      <PageHead title="แก้ไขรูปโครงสร้างหน่วยงาน" />
      <StructureForm structure={structure} />
    </div>
  );
}

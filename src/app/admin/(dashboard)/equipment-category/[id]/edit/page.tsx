import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { EquipmentCategoryForm } from "../../equipment-category-form";

export default async function EditEquipmentCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("equipmentcategory");
  const { id } = await params;
  const category = await prisma.equipmentCategory.findUnique({ where: { id: Number(id) } });
  if (!category) notFound();

  return (
    <div>
      <PageHead title="แก้ไขหมวดหมู่ครุภัณฑ์" />
      <EquipmentCategoryForm category={category} />
    </div>
  );
}

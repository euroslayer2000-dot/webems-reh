import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { MedicineCategoryForm } from "../../medicine-category-form";

export default async function EditMedicineCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("medicinecategory");
  const { id } = await params;
  const category = await prisma.medicineCategory.findUnique({ where: { id: Number(id) } });
  if (!category) notFound();

  return (
    <div>
      <PageHead title="แก้ไขหมวดหมู่ยา" />
      <MedicineCategoryForm category={category} />
    </div>
  );
}

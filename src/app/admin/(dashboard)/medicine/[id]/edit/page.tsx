import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { MedicineForm } from "../../medicine-form";

export default async function EditMedicinePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("medicine");
  const { id } = await params;

  const [categories, item] = await Promise.all([
    prisma.medicineCategory.findMany({ orderBy: [{ sort_order: "asc" }, { name: "asc" }] }),
    prisma.medicine.findUnique({ where: { id: Number(id) } }),
  ]);
  if (!item) notFound();

  return (
    <div>
      <PageHead title="แก้ไขยา" />
      <MedicineForm categories={categories} item={item} />
    </div>
  );
}

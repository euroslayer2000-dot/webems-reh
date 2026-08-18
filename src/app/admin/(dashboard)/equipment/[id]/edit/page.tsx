import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { EquipmentForm } from "../../equipment-form";

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("equipment");
  const { id } = await params;

  const [categories, item] = await Promise.all([
    prisma.equipmentCategory.findMany({ orderBy: [{ sort_order: "asc" }, { name: "asc" }] }),
    prisma.equipment.findUnique({ where: { id: Number(id) } }),
  ]);
  if (!item) notFound();

  return (
    <div>
      <PageHead title="แก้ไขครุภัณฑ์" />
      <EquipmentForm categories={categories} item={item} />
    </div>
  );
}

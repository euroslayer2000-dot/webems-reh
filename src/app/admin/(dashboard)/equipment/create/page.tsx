import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { EquipmentForm } from "../equipment-form";

export default async function CreateEquipmentPage() {
  await requirePageAccess("equipment");
  const categories = await prisma.equipmentCategory.findMany({ orderBy: [{ sort_order: "asc" }, { name: "asc" }] });

  return (
    <div>
      <PageHead title="เพิ่มครุภัณฑ์" />
      <EquipmentForm categories={categories} item={null} />
    </div>
  );
}

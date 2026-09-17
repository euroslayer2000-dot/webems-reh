import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { MedicineForm } from "../medicine-form";

export default async function CreateMedicinePage() {
  await requirePageAccess("medicine");
  const categories = await prisma.medicineCategory.findMany({ orderBy: [{ sort_order: "asc" }, { name: "asc" }] });

  return (
    <div>
      <PageHead title="เพิ่มยา" />
      <MedicineForm categories={categories} item={null} />
    </div>
  );
}

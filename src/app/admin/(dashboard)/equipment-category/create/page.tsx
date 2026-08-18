import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { EquipmentCategoryForm } from "../equipment-category-form";

export default async function CreateEquipmentCategoryPage() {
  await requirePageAccess("equipmentcategory");
  return (
    <div>
      <PageHead title="เพิ่มหมวดหมู่ครุภัณฑ์" />
      <EquipmentCategoryForm category={null} />
    </div>
  );
}

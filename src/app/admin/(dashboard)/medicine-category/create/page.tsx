import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { MedicineCategoryForm } from "../medicine-category-form";

export default async function CreateMedicineCategoryPage() {
  await requirePageAccess("medicinecategory");
  return (
    <div>
      <PageHead title="เพิ่มหมวดหมู่ยา" />
      <MedicineCategoryForm category={null} />
    </div>
  );
}

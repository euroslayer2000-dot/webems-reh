import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { StructureForm } from "../structure-form";

export default async function CreateStructurePage() {
  await requirePageAccess("structure");
  return (
    <div>
      <PageHead title="เพิ่มรูปโครงสร้างหน่วยงาน" />
      <StructureForm structure={null} />
    </div>
  );
}

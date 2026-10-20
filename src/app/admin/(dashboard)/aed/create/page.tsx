import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { AedForm } from "../aed-form";

export default async function CreateAedPage() {
  await requirePageAccess("aed");
  return (
    <div>
      <PageHead title="เพิ่มจุดติดตั้งเครื่อง AED" />
      <AedForm aed={null} />
    </div>
  );
}

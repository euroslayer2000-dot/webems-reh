import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { StationForm } from "../station-form";

export default async function CreateStationPage() {
  await requirePageAccess("station");
  return (
    <div>
      <PageHead title="เพิ่มจุดหน่วยกู้ชีพ" />
      <StationForm station={null} />
    </div>
  );
}

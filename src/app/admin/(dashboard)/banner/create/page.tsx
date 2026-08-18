import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { BannerForm } from "../banner-form";

export default async function CreateBannerPage() {
  await requirePageAccess("banner");
  return (
    <div>
      <PageHead title="เพิ่มแบนเนอร์" />
      <BannerForm banner={null} />
    </div>
  );
}

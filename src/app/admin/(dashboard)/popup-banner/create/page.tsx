import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { BannerForm } from "../../banner/banner-form";

export default async function CreatePopupBannerPage() {
  await requirePageAccess("banner");

  return (
    <div>
      <PageHead title="เพิ่มป๊อปอัพใหม่" />
      <BannerForm banner={null} backHref="/admin/popup-banner" />
    </div>
  );
}

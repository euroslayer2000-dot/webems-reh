import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { SettingForm } from "./setting-form";

export default async function AdminSettingPage() {
  await requirePageAccess("setting");
  const rows = await prisma.setting.findMany();
  const s = Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value ?? ""]));

  return (
    <div>
      <PageHead title="ตั้งค่าเว็บไซต์" />
      <SettingForm s={s} />
    </div>
  );
}

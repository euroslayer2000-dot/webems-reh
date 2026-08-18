import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { inputClass } from "@/components/admin/form-field";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard, AdminCardBody, AdminCardHead } from "@/components/admin/admin-card";
import { btnPrimary } from "@/components/admin/button-styles";
import { updateSettings } from "./actions";

export default async function AdminSettingPage() {
  await requirePageAccess("setting");
  const rows = await prisma.setting.findMany();
  const s = Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value ?? ""]));

  return (
    <div>
      <PageHead title="ตั้งค่าเว็บไซต์" />

      <form action={updateSettings} className="grid gap-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <AdminCard>
            <AdminCardHead title="ข้อมูลทั่วไป" />
            <AdminCardBody className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text">ชื่อเว็บไซต์</label>
                <input name="site_name" defaultValue={s.site_name} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">คำโปรย (Tagline)</label>
                <input name="site_tagline" defaultValue={s.site_tagline} className={inputClass} />
              </div>
            </AdminCardBody>
          </AdminCard>

          <AdminCard>
            <AdminCardHead title="โซเชียลมีเดีย" />
            <AdminCardBody className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Facebook URL</label>
                <input name="facebook" defaultValue={s.facebook} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">Line URL</label>
                <input name="line" defaultValue={s.line} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">YouTube URL</label>
                <input name="youtube" defaultValue={s.youtube} className={inputClass} />
              </div>
            </AdminCardBody>
          </AdminCard>
        </div>

        <AdminCard>
          <AdminCardHead title="ข้อมูลการติดต่อ" />
          <AdminCardBody className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-text">สายด่วนฉุกเฉิน</label>
              <input name="emergency_phone" defaultValue={s.emergency_phone} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text">โทรศัพท์สำนักงาน</label>
              <input name="office_phone" defaultValue={s.office_phone} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text">อีเมล</label>
              <input name="email" type="email" defaultValue={s.email} className={inputClass} />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-sm font-medium text-text">ที่อยู่</label>
              <input name="address" defaultValue={s.address} className={inputClass} />
            </div>
            <div className="sm:col-span-3">
              <label className="mb-1 block text-sm font-medium text-text">Google Map (โค้ด iframe ฝัง)</label>
              <textarea name="map_embed" rows={3} defaultValue={s.map_embed} placeholder='<iframe src="https://www.google.com/maps/embed?...">' className={inputClass} />
              <p className="mt-1 text-xs text-text-muted">วางโค้ด embed จาก Google Maps (Share → Embed a map)</p>
            </div>
          </AdminCardBody>
        </AdminCard>

        <AdminCard>
          <AdminCardHead title="เกี่ยวกับเรา" />
          <AdminCardBody className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-text">วิสัยทัศน์</label>
              <textarea name="about_vision" rows={4} defaultValue={s.about_vision} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text">พันธกิจ</label>
              <textarea name="about_mission" rows={4} defaultValue={s.about_mission} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-text">ประวัติความเป็นมา</label>
              <textarea name="about_history" rows={6} defaultValue={s.about_history} className={inputClass} />
            </div>
          </AdminCardBody>
        </AdminCard>

        <button type="submit" className={`w-fit ${btnPrimary}`}>
          บันทึกการตั้งค่า
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import { Table2 } from "lucide-react";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { btnGhostSm } from "@/components/admin/button-styles";
import { FtEmsForms } from "./ft-ems-forms";

export default async function AdminFtEmsPage() {
  await requirePageAccess("ftems");

  return (
    <div>
      <PageHead
        title="FT EMS REH 2570"
        subtitle="บันทึกข้อมูลปีงบประมาณ 2570 (ต.ค. – ก.ย.) ลง Google Sheet"
        action={
          <Link href="/admin/ft-ems/summary" className={`${btnGhostSm} flex items-center gap-1.5`}>
            <Table2 size={14} /> ดูตารางสรุป
          </Link>
        }
      />
      <FtEmsForms />
    </div>
  );
}

import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { PatientReportForm } from "../patient-report-form";

export default async function CreatePatientReportPage() {
  await requirePageAccess("patientreport");
  return (
    <div>
      <PageHead title="เพิ่มข้อมูลรับแจ้งเหตุ" />
      <PatientReportForm report={null} />
    </div>
  );
}

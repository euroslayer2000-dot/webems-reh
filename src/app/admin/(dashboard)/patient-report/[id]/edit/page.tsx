import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { PatientReportForm } from "../../patient-report-form";

export default async function EditPatientReportPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("patientreport");
  const { id } = await params;

  const report = await prisma.patientReport.findUnique({ where: { id: Number(id) } });
  if (!report) notFound();

  return (
    <div>
      <PageHead title="แก้ไขข้อมูลรับแจ้งเหตุ" />
      <PatientReportForm report={report} />
    </div>
  );
}

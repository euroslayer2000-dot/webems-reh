import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { DispenseCreateForm } from "../dispense-create-form";

export default async function CreateDispensePage() {
  await requirePageAccess("medicinedispense");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [medicines, patientReports] = await Promise.all([
    prisma.medicine.findMany({
      where: { is_active: true, batches: { some: { quantity_on_hand: { gt: 0 }, expiry_date: { gte: today } } } },
      include: {
        batches: {
          where: { quantity_on_hand: { gt: 0 }, expiry_date: { gte: today } },
          orderBy: { expiry_date: "asc" },
        },
      },
      orderBy: { generic_name: "asc" },
    }),
    prisma.patientReport.findMany({ orderBy: { report_date: "desc" }, take: 30 }),
  ]);

  return (
    <div>
      <PageHead title="บันทึกการจ่ายยา" />
      <DispenseCreateForm medicines={medicines} patientReports={patientReports} />
    </div>
  );
}

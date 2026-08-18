import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { PersonnelForm } from "../personnel-form";

export default async function CreatePersonnelPage() {
  await requirePageAccess("personnel");
  const groups = await prisma.personnelGroup.findMany({ orderBy: { sort_order: "asc" } });

  return (
    <div>
      <PageHead title="เพิ่มบุคลากร" />
      <PersonnelForm groups={groups} person={null} />
    </div>
  );
}

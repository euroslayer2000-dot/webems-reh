import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { PersonnelForm } from "../../personnel-form";

export default async function EditPersonnelPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("personnel");
  const { id } = await params;

  const [groups, person] = await Promise.all([
    prisma.personnelGroup.findMany({ orderBy: { sort_order: "asc" } }),
    prisma.personnel.findUnique({ where: { id: Number(id) } }),
  ]);
  if (!person) notFound();

  return (
    <div>
      <PageHead title="แก้ไขบุคลากร" />
      <PersonnelForm groups={groups} person={person} />
    </div>
  );
}

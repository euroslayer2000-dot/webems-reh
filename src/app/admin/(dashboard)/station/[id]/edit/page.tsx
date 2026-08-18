import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { StationForm } from "../../station-form";

export default async function EditStationPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("station");
  const { id } = await params;
  const station = await prisma.station.findUnique({ where: { id: Number(id) } });
  if (!station) notFound();

  return (
    <div>
      <PageHead title="แก้ไขจุดหน่วยกู้ชีพ" />
      <StationForm station={station} />
    </div>
  );
}

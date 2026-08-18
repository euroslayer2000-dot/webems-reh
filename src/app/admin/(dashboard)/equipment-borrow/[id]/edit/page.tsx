import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { BorrowEditForm } from "../../borrow-edit-form";

export default async function EditBorrowPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("equipmentborrow");
  const { id } = await params;
  const loan = await prisma.equipmentBorrow.findUnique({ where: { id: Number(id) }, include: { equipment: true } });
  if (!loan) notFound();

  const borrowCount = await prisma.equipmentBorrow.count({ where: { equipment_id: loan.equipment_id } });

  return (
    <div>
      <PageHead title="แก้ไขรายการยืมครุภัณฑ์" />
      <BorrowEditForm loan={{ ...loan, borrow_count: borrowCount }} />
    </div>
  );
}

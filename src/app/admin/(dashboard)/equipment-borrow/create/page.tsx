import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { BorrowCreateForm } from "../borrow-create-form";

export default async function CreateBorrowPage() {
  await requirePageAccess("equipmentborrow");
  const [equipments, borrowCounts] = await Promise.all([
    prisma.equipment.findMany({
      where: { status: "available" },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
    prisma.equipmentBorrow.groupBy({ by: ["equipment_id"], _count: true }),
  ]);

  const borrowCountById = new Map(borrowCounts.map((r) => [r.equipment_id, r._count]));
  const items = equipments.map((eq) => ({ ...eq, borrow_count: borrowCountById.get(eq.id) ?? 0 }));

  return (
    <div>
      <PageHead title="สร้างรายการยืมครุภัณฑ์" />
      <BorrowCreateForm equipments={items} />
    </div>
  );
}

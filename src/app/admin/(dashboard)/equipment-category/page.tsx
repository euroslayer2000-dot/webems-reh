import Link from "next/link";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deleteEquipmentCategory, moveEquipmentCategory } from "./actions";

export default async function AdminEquipmentCategoryPage() {
  await requirePageAccess("equipmentcategory");
  const categories = await prisma.equipmentCategory.findMany({ orderBy: [{ sort_order: "asc" }, { name: "asc" }] });

  return (
    <div>
      <PageHead
        title="จัดการหมวดหมู่ครุภัณฑ์"
        action={
          <Link href="/admin/equipment-category/create" className={btnPrimary}>
            <Plus size={16} /> เพิ่มหมวดหมู่
          </Link>
        }
      />

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">รหัส</th>
              <th className="px-5 py-3">ชื่อหมวดหมู่</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((cat, i) => (
              <tr key={cat.id}>
                <td className="px-5 py-2.5 font-mono text-text-muted">{cat.code}</td>
                <td className="px-5 py-2.5 font-semibold text-text">{cat.name}</td>
                <td className="px-5 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <form action={moveEquipmentCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button type="submit" disabled={i === 0} aria-label="เลื่อนขึ้น" className={`${btnGhostSm} disabled:opacity-30`}>
                        <ChevronUp size={15} />
                      </button>
                    </form>
                    <form action={moveEquipmentCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button type="submit" disabled={i === categories.length - 1} aria-label="เลื่อนลง" className={`${btnGhostSm} disabled:opacity-30`}>
                        <ChevronDown size={15} />
                      </button>
                    </form>
                    <Link href={`/admin/equipment-category/${cat.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                    <form action={deleteEquipmentCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <ConfirmSubmitButton confirmText={`ลบหมวดหมู่ "${cat.name}" ?`} className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={3} className="px-5 py-10 text-center text-text-muted">ยังไม่มีหมวดหมู่ครุภัณฑ์</td></tr>}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

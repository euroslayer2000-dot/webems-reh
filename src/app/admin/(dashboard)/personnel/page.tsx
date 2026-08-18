import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { uploadUrl } from "@/lib/upload";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deletePersonnel, togglePersonnel } from "./actions";

export default async function AdminPersonnelPage() {
  await requirePageAccess("personnel");
  const personnel = await prisma.personnel.findMany({ include: { group: true }, orderBy: { sort_order: "asc" } });

  return (
    <div>
      <PageHead
        title="จัดการบุคลากร"
        action={
          <Link href="/admin/personnel/create" className={btnPrimary}>
            <Plus size={16} /> เพิ่มบุคลากร
          </Link>
        }
      />

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">รูป</th>
              <th className="px-5 py-3">ชื่อ-นามสกุล</th>
              <th className="px-5 py-3">กลุ่ม</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {personnel.map((person) => (
              <tr key={person.id}>
                <td className="px-5 py-2.5">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-bg-soft">
                    <Image src={uploadUrl(person.photo, "/assets/img/person-placeholder.svg")} alt={person.full_name} fill sizes="40px" className="object-cover" />
                  </div>
                </td>
                <td className="px-5 py-2.5 font-semibold text-text">{person.full_name}</td>
                <td className="px-5 py-2.5 text-text-muted">{person.group?.name ?? "-"}</td>
                <td className="px-5 py-2.5">
                  <StatusBadge active={person.is_active} activeLabel="แสดงผล" inactiveLabel="ซ่อน" />
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <form action={togglePersonnel}>
                      <input type="hidden" name="id" value={person.id} />
                      <button type="submit" className={btnGhostSm}>
                        {person.is_active ? "ซ่อน" : "แสดง"}
                      </button>
                    </form>
                    <Link href={`/admin/personnel/${person.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                    <form action={deletePersonnel}>
                      <input type="hidden" name="id" value={person.id} />
                      <ConfirmSubmitButton confirmText={`ลบบุคลากร "${person.full_name}" ?`} className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {personnel.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-text-muted">ยังไม่มีบุคลากร</td></tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

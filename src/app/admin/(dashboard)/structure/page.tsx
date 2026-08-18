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
import { deleteStructure, toggleStructure } from "./actions";

export default async function AdminStructurePage() {
  await requirePageAccess("structure");
  const structures = await prisma.orgStructure.findMany({ orderBy: [{ sort_order: "asc" }, { id: "asc" }] });

  return (
    <div>
      <PageHead
        title="จัดการโครงสร้างหน่วยงาน"
        action={
          <Link href="/admin/structure/create" className={btnPrimary}>
            <Plus size={16} /> เพิ่มรูป
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {structures.map((item) => (
          <AdminCard key={item.id}>
            <div className="relative aspect-video bg-bg-soft">
              <Image src={uploadUrl(item.image)} alt={item.title ?? ""} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain" />
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-text">{item.title || "-"}</p>
              <div className="mt-1.5">
                <StatusBadge active={item.is_active} activeLabel="แสดงผล" inactiveLabel="ซ่อน" />
              </div>
              <div className="mt-3 flex gap-1.5">
                <form action={toggleStructure}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className={btnGhostSm}>
                    {item.is_active ? "ซ่อน" : "แสดง"}
                  </button>
                </form>
                <Link href={`/admin/structure/${item.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                <form action={deleteStructure}>
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmSubmitButton confirmText="ลบรูปนี้ ?" className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                </form>
              </div>
            </div>
          </AdminCard>
        ))}
        {structures.length === 0 && <p className="col-span-full py-10 text-center text-sm text-text-muted">ยังไม่มีรูปโครงสร้างหน่วยงาน</p>}
      </div>
    </div>
  );
}

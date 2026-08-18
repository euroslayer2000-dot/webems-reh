import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatFileSize } from "@/lib/format";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deleteDownload } from "./actions";

export default async function AdminDownloadPage() {
  await requirePageAccess("download");
  const documents = await prisma.download.findMany({ include: { category: true }, orderBy: { id: "desc" } });

  return (
    <div>
      <PageHead
        title="จัดการเอกสารดาวน์โหลด"
        action={
          <Link href="/admin/download/create" className={btnPrimary}>
            <Plus size={16} /> เพิ่มเอกสาร
          </Link>
        }
      />

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">ชื่อเอกสาร</th>
              <th className="px-5 py-3">หมวดหมู่</th>
              <th className="px-5 py-3">ประเภท</th>
              <th className="px-5 py-3">ขนาด</th>
              <th className="px-5 py-3">ดาวน์โหลด</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-5 py-2.5 font-semibold text-text">{doc.title}</td>
                <td className="px-5 py-2.5 text-text-muted">{doc.category?.name ?? "-"}</td>
                <td className="px-5 py-2.5 uppercase text-text-muted">{doc.file_type}</td>
                <td className="px-5 py-2.5 text-text-muted">{formatFileSize(doc.file_size)}</td>
                <td className="px-5 py-2.5 text-text-muted">{doc.download_count.toLocaleString("th-TH")}</td>
                <td className="px-5 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/admin/download/${doc.id}/edit`} className={btnGhostSm}>แก้ไข</Link>
                    <form action={deleteDownload}>
                      <input type="hidden" name="id" value={doc.id} />
                      <ConfirmSubmitButton confirmText={`ลบเอกสาร "${doc.title}" ?`} className={btnDangerSm}>ลบ</ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {documents.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-text-muted">ยังไม่มีเอกสาร</td></tr>}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

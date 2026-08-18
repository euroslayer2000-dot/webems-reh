import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { btnDangerSm, btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { deleteNews, toggleNews } from "./actions";

export default async function AdminNewsPage() {
  await requirePageAccess("news");
  const news = await prisma.news.findMany({
    include: { category: true, author: true },
    orderBy: { created_at: "desc" },
  });

  return (
    <div>
      <PageHead
        title="จัดการข่าวประชาสัมพันธ์"
        action={
          <Link href="/admin/news/create" className={btnPrimary}>
            <Plus size={16} /> เพิ่มข่าวใหม่
          </Link>
        }
      />

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">หัวข้อ</th>
              <th className="px-5 py-3">หมวดหมู่</th>
              <th className="px-5 py-3">ผู้เขียน</th>
              <th className="px-5 py-3">สถานะ</th>
              <th className="px-5 py-3">ยอดวิว</th>
              <th className="px-5 py-3">เผยแพร่เมื่อ</th>
              <th className="px-5 py-3 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {news.map((item) => (
              <tr key={item.id}>
                <td className="max-w-xs px-5 py-3 font-semibold text-text">{item.title}</td>
                <td className="px-5 py-3 text-text-muted">{item.category?.name ?? "-"}</td>
                <td className="px-5 py-3 text-text-muted">{item.author?.name ?? "-"}</td>
                <td className="px-5 py-3">
                  <StatusBadge active={item.status === "published"} activeLabel="เผยแพร่" inactiveLabel="แบบร่าง" />
                </td>
                <td className="px-5 py-3 text-text-muted">{item.views.toLocaleString("th-TH")}</td>
                <td className="px-5 py-3 text-text-muted">{formatDateTh(item.published_at)}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    <form action={toggleNews}>
                      <input type="hidden" name="id" value={item.id} />
                      <button type="submit" className={btnGhostSm}>
                        {item.status === "published" ? "เป็นร่าง" : "เผยแพร่"}
                      </button>
                    </form>
                    <Link href={`/admin/news/${item.id}/edit`} className={btnGhostSm}>
                      แก้ไข
                    </Link>
                    <form action={deleteNews}>
                      <input type="hidden" name="id" value={item.id} />
                      <ConfirmSubmitButton confirmText={`ลบข่าว "${item.title}" ?`} className={btnDangerSm}>
                        ลบ
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {news.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-text-muted">ยังไม่มีข่าว</td>
              </tr>
            )}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

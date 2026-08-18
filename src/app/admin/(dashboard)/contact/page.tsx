import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard } from "@/components/admin/admin-card";

export default async function AdminContactPage() {
  await requirePageAccess("contact");
  const messages = await prisma.contact.findMany({ orderBy: { created_at: "desc" } });

  return (
    <div>
      <PageHead title="ข้อความติดต่อ" />

      <AdminCard className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs font-semibold uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">ชื่อผู้ส่ง</th>
              <th className="px-5 py-3">หัวข้อ</th>
              <th className="px-5 py-3">วันที่ส่ง</th>
              <th className="px-5 py-3">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {messages.map((msg) => (
              <tr key={msg.id} className={msg.is_read ? "" : "bg-primary-50/40"}>
                <td className="px-5 py-2.5">
                  <Link href={`/admin/contact/${msg.id}`} className={`hover:underline ${msg.is_read ? "text-text" : "font-bold text-text"}`}>
                    {msg.name}
                  </Link>
                </td>
                <td className="px-5 py-2.5 text-text-muted">{msg.subject || "ไม่มีหัวข้อ"}</td>
                <td className="px-5 py-2.5 text-text-muted">{formatDateTh(msg.created_at, true)}</td>
                <td className="px-5 py-2.5">
                  {!msg.is_read && <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">ใหม่</span>}
                </td>
              </tr>
            ))}
            {messages.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-text-muted">ยังไม่มีข้อความติดต่อ</td></tr>}
          </tbody>
        </table>
      </AdminCard>
    </div>
  );
}

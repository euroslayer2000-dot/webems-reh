import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { AdminCard, AdminCardBody, AdminCardHead } from "@/components/admin/admin-card";
import { deleteContact } from "../actions";

export default async function AdminContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("contact");
  const { id } = await params;
  const msg = await prisma.contact.findUnique({ where: { id: Number(id) } });
  if (!msg) notFound();

  if (!msg.is_read) {
    after(() => prisma.contact.update({ where: { id: msg.id }, data: { is_read: true } }));
  }

  return (
    <div>
      <Link href="/admin/contact" className="mb-4 flex w-fit items-center gap-1 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={14} /> กลับไปรายการ
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <AdminCard>
          <AdminCardHead title={msg.subject || "ไม่มีหัวข้อ"} />
          <AdminCardBody>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{msg.message}</p>
          </AdminCardBody>
        </AdminCard>

        <AdminCard className="h-fit">
          <AdminCardHead title="ข้อมูลผู้ส่ง" />
          <AdminCardBody>
            <ul className="flex flex-col gap-3 text-sm">
              <li><span className="block text-xs text-text-muted">ชื่อ</span>{msg.name}</li>
              <li className="flex items-start gap-1.5">
                <Mail size={14} className="mt-0.5 text-text-muted" />
                {msg.email ? <a href={`mailto:${msg.email}`} className="text-primary-600 hover:underline">{msg.email}</a> : "-"}
              </li>
              <li className="flex items-start gap-1.5"><Phone size={14} className="mt-0.5 text-text-muted" />{msg.phone || "-"}</li>
              <li className="flex items-start gap-1.5"><Calendar size={14} className="mt-0.5 text-text-muted" />{formatDateTh(msg.created_at, true)}</li>
            </ul>

            <form action={deleteContact} className="mt-4">
              <input type="hidden" name="id" value={msg.id} />
              <ConfirmSubmitButton confirmText="ลบข้อความนี้ ?" className="w-full rounded-[10px] border border-danger/30 py-2.5 text-sm font-semibold text-danger hover:bg-danger/10">
                ลบข้อความ
              </ConfirmSubmitButton>
            </form>
          </AdminCardBody>
        </AdminCard>
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { formatDateTh } from "@/lib/format";
import { uploadUrl } from "@/lib/upload";
import { PageHead } from "@/components/admin/page-head";
import { AdminCard, AdminCardBody, AdminCardHead } from "@/components/admin/admin-card";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";
import { btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { completeStockTake, toggleStockTakeItem } from "../actions";

export default async function StockTakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageAccess("equipment");
  const { id } = await params;
  const stockTakeId = Number(id);

  const session = await prisma.equipmentStockTake.findUnique({
    where: { id: stockTakeId },
    include: { items: { include: { equipment: { include: { category: true } } }, orderBy: [{ checked: "asc" }, { id: "asc" }] } },
  });
  if (!session) notFound();

  const checkedCount = session.items.filter((i) => i.checked).length;
  const missingItems = session.items.filter((i) => !i.checked);

  return (
    <div>
      <Link href="/admin/equipment-stock-take" className="mb-3 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={15} /> กลับไปรายการรอบตรวจนับ
      </Link>
      <PageHead
        title={session.title}
        subtitle={`เริ่มเมื่อ ${formatDateTh(session.started_at, true)}${session.completed_at ? ` · ปิดรอบเมื่อ ${formatDateTh(session.completed_at, true)}` : ""}`}
        action={
          !session.completed_at && (
            <form action={completeStockTake}>
              <input type="hidden" name="id" value={session.id} />
              <ConfirmSubmitButton
                confirmText={`ปิดรอบตรวจนับ? รายการที่ยังไม่ทำเครื่องหมาย (${missingItems.length} รายการ) จะถูกถือว่าไม่พบ`}
                className={btnPrimary}
              >
                ปิดรอบตรวจนับ
              </ConfirmSubmitButton>
            </form>
          )
        }
      />

      <AdminCard className="mb-6">
        <AdminCardBody>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-text">ความคืบหน้า</span>
            <span className="text-text-muted">
              {checkedCount} / {session.items.length} รายการ
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-soft">
            <div
              className="h-full bg-[image:var(--grad-primary)]"
              style={{ width: `${session.items.length ? (checkedCount / session.items.length) * 100 : 0}%` }}
            />
          </div>
        </AdminCardBody>
      </AdminCard>

      {session.completed_at && missingItems.length > 0 && (
        <div className="mb-6 rounded-[var(--radius-lg)] border border-danger/30 bg-danger/10 p-5">
          <h2 className="mb-2 text-sm font-bold text-danger">รายการที่ไม่พบ ({missingItems.length} รายการ)</h2>
          <ul className="flex flex-col gap-1 text-sm text-text">
            {missingItems.map((i) => (
              <li key={i.id}>
                {i.equipment.name} ({i.equipment.code})
              </li>
            ))}
          </ul>
        </div>
      )}

      <AdminCard>
        <AdminCardHead title="รายการครุภัณฑ์" />
        <div className="divide-y divide-border">
          {session.items.map((i) => (
            <div key={i.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-bg-soft">
                <Image src={uploadUrl(i.equipment.photo)} alt="" fill sizes="40px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-text">{i.equipment.name}</div>
                <div className="text-xs text-text-muted">
                  {i.equipment.code} · {i.equipment.category?.name ?? "ไม่ระบุหมวดหมู่"} · {i.equipment.location ?? "ไม่ระบุสถานที่"}
                </div>
              </div>
              {i.checked && i.checked_at && (
                <span className="text-xs text-text-muted">พบเมื่อ {formatDateTh(i.checked_at, true)}</span>
              )}
              {!session.completed_at ? (
                <form action={toggleStockTakeItem}>
                  <input type="hidden" name="id" value={i.id} />
                  <input type="hidden" name="stock_take_id" value={session.id} />
                  <input type="hidden" name="checked" value={i.checked ? "1" : "0"} />
                  <button
                    type="submit"
                    className={`${btnGhostSm} inline-flex items-center gap-1.5 ${i.checked ? "text-primary-600" : ""}`}
                  >
                    {i.checked ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                    {i.checked ? "พบแล้ว" : "ยังไม่พบ"}
                  </button>
                </form>
              ) : (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${i.checked ? "text-primary-600" : "text-danger"}`}>
                  {i.checked ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  {i.checked ? "พบแล้ว" : "ไม่พบ"}
                </span>
              )}
            </div>
          ))}
          {session.items.length === 0 && <p className="px-5 py-10 text-center text-text-muted">ไม่มีครุภัณฑ์ในระบบขณะเริ่มรอบตรวจนับนี้</p>}
        </div>
      </AdminCard>
    </div>
  );
}

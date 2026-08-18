import Link from "next/link";
import { headers } from "next/headers";
import { Download, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePageAccess } from "@/lib/admin-auth";
import { PageHead } from "@/components/admin/page-head";
import { btnGhostSm, btnPrimary } from "@/components/admin/button-styles";
import { EquipmentTable } from "./equipment-table";

const FILTER_TABS = [
  { key: "all", label: "ครุภัณฑ์ทั้งหมด" },
  { key: "available", label: "พร้อมใช้งาน" },
  { key: "borrowed", label: "ถูกยืม" },
  { key: "damaged", label: "ชำรุด" },
] as const;

export default async function AdminEquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePageAccess("equipment");
  const { status: rawStatus } = await searchParams;
  const activeStatus = FILTER_TABS.some((t) => t.key === rawStatus) ? rawStatus! : "all";

  const allItems = await prisma.equipment.findMany({ include: { category: true }, orderBy: { created_at: "desc" } });
  const counts: Record<string, number> = { all: allItems.length };
  for (const item of allItems) counts[item.status] = (counts[item.status] ?? 0) + 1;

  const items = activeStatus === "all" ? allItems : allItems.filter((item) => item.status === activeStatus);

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  return (
    <div>
      <PageHead
        title="จัดการครุภัณฑ์"
        action={
          <div className="flex gap-2">
            <Link
              href={`/admin/equipment/export${activeStatus === "all" ? "" : `?status=${activeStatus}`}`}
              className={`${btnGhostSm} inline-flex items-center gap-1.5`}
            >
              <Download size={16} /> ส่งออก Excel/CSV
            </Link>
            <Link href="/admin/equipment/create" className={btnPrimary}>
              <Plus size={16} /> เพิ่มครุภัณฑ์
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/admin/equipment" : `/admin/equipment?status=${tab.key}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              activeStatus === tab.key
                ? "border-transparent bg-[image:var(--grad-primary)] text-white"
                : "border-border text-text-muted hover:bg-bg-soft"
            }`}
          >
            {tab.label} <span className="ml-1 opacity-80">{counts[tab.key] ?? 0}</span>
          </Link>
        ))}
      </div>

      <EquipmentTable items={items} baseUrl={baseUrl} />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Landmark, MapPin, Ruler, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { formatDateTh } from "@/lib/format";
import { EQUIPMENT_STATUS_META } from "@/lib/equipment-status";
import { EquipmentPhotoGallery } from "@/components/public/equipment-photo-gallery";

async function getItem(code: string) {
  return prisma.equipment.findUnique({ where: { code }, include: { category: true } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const item = await getItem(code);
  return item ? { title: item.name, description: `ข้อมูลครุภัณฑ์เลข ${item.code} — ${item.name}` } : {};
}

export default async function EquipmentShowPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const item = await getItem(code);
  if (!item) notFound();

  const status = EQUIPMENT_STATUS_META[item.status];
  const photos = [item.photo, item.photo2, item.photo3].filter((p): p is string => !!p);

  return (
    <Container className="max-w-2xl py-14">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <EquipmentPhotoGallery photos={photos} alt={item.name} />

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
            <span className="rounded-full bg-bg-soft px-3 py-1 text-xs font-medium text-text-muted">
              รหัส {item.code}
            </span>
          </div>

          <h1 className="mt-3 text-xl font-bold text-text">{item.name}</h1>
          {item.description && <p className="mt-2 text-sm text-text-muted">{item.description}</p>}

          <dl className="mt-6 grid gap-3 border-t border-border pt-5 text-sm">
            {item.category && (
              <div className="flex items-center gap-2.5">
                <Tag size={16} className="text-primary-500" />
                <dt className="text-text-muted">หมวดหมู่</dt>
                <dd className="ml-auto font-medium text-text">{item.category.name}</dd>
              </div>
            )}
            {item.brand && (
              <div className="flex items-center gap-2.5">
                <Landmark size={16} className="text-primary-500" />
                <dt className="text-text-muted">ยี่ห้อ</dt>
                <dd className="ml-auto font-medium text-text">{item.brand}</dd>
              </div>
            )}
            {item.unit && (
              <div className="flex items-center gap-2.5">
                <Ruler size={16} className="text-primary-500" />
                <dt className="text-text-muted">หน่วยนับ</dt>
                <dd className="ml-auto font-medium text-text">{item.unit}</dd>
              </div>
            )}
            {item.location && (
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-primary-500" />
                <dt className="text-text-muted">ตำแหน่งที่เก็บ</dt>
                <dd className="ml-auto font-medium text-text">{item.location}</dd>
              </div>
            )}
            {item.purchase_date && (
              <div className="flex items-center justify-between">
                <dt className="text-text-muted">วันที่จัดซื้อ</dt>
                <dd className="font-medium text-text">{formatDateTh(item.purchase_date)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </Container>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banknote, Eye, FileText, History, Landmark, MapPin, Ruler, Tag, X } from "lucide-react";
import { uploadUrl } from "@/lib/upload";
import { formatDateTh } from "@/lib/format";
import { EQUIPMENT_STATUS_META } from "@/lib/equipment-status";
import { btnGhostSm } from "./button-styles";

type EquipmentDetail = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  photo: string | null;
  photo2: string | null;
  photo3: string | null;
  brand: string | null;
  unit: string;
  location: string | null;
  status: keyof typeof EQUIPMENT_STATUS_META;
  purchase_date: Date | null;
  purchase_price: unknown;
  warranty_document: string | null;
  receipt_document: string | null;
  category: { name: string } | null;
};

export function EquipmentDetailButton({ item }: { item: EquipmentDetail }) {
  const [open, setOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const status = EQUIPMENT_STATUS_META[item.status];
  const photos = [item.photo, item.photo2, item.photo3].filter((p): p is string => !!p);
  const mainPhoto = photos[activePhoto] ?? photos[0] ?? null;
  const price = item.purchase_price != null ? Number(item.purchase_price) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setActivePhoto(0);
          setOpen(true);
        }}
        className={`${btnGhostSm} inline-flex items-center gap-1`}
      >
        <Eye size={14} /> ดูรายละเอียด
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-[var(--radius-lg)] bg-surface shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-bg-soft">
              <Image src={uploadUrl(mainPhoto)} alt={item.name} fill sizes="512px" className="object-cover" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X size={18} />
              </button>
            </div>

            {photos.length > 1 && (
              <div className="flex gap-2 border-b border-border bg-bg-soft p-3">
                {photos.map((p, i) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActivePhoto(i)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                      i === activePhoto ? "border-primary-500" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={uploadUrl(p)} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="max-h-[60vh] overflow-y-auto p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
                <span className="rounded-full bg-bg-soft px-3 py-1 text-xs font-medium text-text-muted">รหัส {item.code}</span>
              </div>

              <h3 className="mt-3 text-lg font-bold text-text">{item.name}</h3>
              {item.description && <p className="mt-2 text-sm text-text-muted">{item.description}</p>}

              <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm">
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
                {price != null && (
                  <div className="flex items-center gap-2.5">
                    <Banknote size={16} className="text-primary-500" />
                    <dt className="text-text-muted">ราคาที่จัดซื้อ</dt>
                    <dd className="ml-auto font-medium text-text">{price.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</dd>
                  </div>
                )}
              </dl>

              {(item.warranty_document || item.receipt_document) && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  {item.warranty_document && (
                    <a
                      href={uploadUrl(item.warranty_document)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-bg-soft px-3 py-1.5 text-xs font-medium text-text hover:bg-border"
                    >
                      <FileText size={13} /> ใบรับประกัน
                    </a>
                  )}
                  {item.receipt_document && (
                    <a
                      href={uploadUrl(item.receipt_document)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-bg-soft px-3 py-1.5 text-xs font-medium text-text hover:bg-border"
                    >
                      <FileText size={13} /> ใบเสร็จ/ใบสั่งซื้อ
                    </a>
                  )}
                </div>
              )}

              <Link
                href={`/admin/equipment/${item.id}/history`}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline"
              >
                <History size={14} /> ดูประวัติการยืม-คืนและการเปลี่ยนสถานะทั้งหมด
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

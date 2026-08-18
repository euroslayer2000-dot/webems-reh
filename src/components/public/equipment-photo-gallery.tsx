"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadUrl } from "@/lib/upload";

export function EquipmentPhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const mainPhoto = photos[active] ?? null;

  return (
    <div>
      <div className="relative aspect-video bg-bg-soft">
        <Image src={uploadUrl(mainPhoto)} alt={alt} fill sizes="(max-width: 672px) 100vw, 672px" className="object-cover" />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 border-b border-border bg-bg-soft p-3">
          {photos.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? "border-primary-500" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={uploadUrl(p)} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

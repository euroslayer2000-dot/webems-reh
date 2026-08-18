"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function LightboxGallery({ images }: { images: { id: number; src: string; caption: string | null }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = () => setOpenIndex(null);
  const prev = () => setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const next = () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-bg-soft"
          >
            <Image
              src={image.src}
              alt={image.caption ?? ""}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={close}
            aria-label="ปิด"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={20} />
          </button>

          <button
            type="button"
            onClick={prev}
            aria-label="ก่อนหน้า"
            className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
          >
            <ChevronLeft size={22} />
          </button>

          <div className="relative h-[75vh] w-full max-w-4xl">
            <Image
              src={images[openIndex].src}
              alt={images[openIndex].caption ?? ""}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-contain"
            />
          </div>

          {images[openIndex].caption && (
            <p className="mt-3 max-w-xl text-center text-sm text-white/85">{images[openIndex].caption}</p>
          )}

          <button
            type="button"
            onClick={next}
            aria-label="ถัดไป"
            className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </>
  );
}

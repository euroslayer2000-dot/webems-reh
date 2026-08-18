"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { uploadUrl } from "@/lib/upload";

export type HeroBanner = { id: number; title: string | null; image: string; link_url: string | null };

export function HeroBannerCarousel({ banners }: { banners: HeroBanner[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative mx-auto aspect-[21/9] w-full max-w-5xl overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]">
      {banners.map((banner, i) => {
        const content = (
          <div className="relative h-full w-full">
            <Image
              src={uploadUrl(banner.image)}
              alt={banner.title ?? ""}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority={i === 0}
            />
            {banner.title && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-sm font-semibold text-white sm:text-base">{banner.title}</p>
              </div>
            )}
          </div>
        );

        return (
          <div
            key={banner.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
            aria-hidden={i !== active}
          >
            {banner.link_url ? (
              <Link href={banner.link_url} className="block h-full w-full">
                {content}
              </Link>
            ) : (
              content
            )}
          </div>
        );
      })}

      {banners.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`แบนเนอร์ที่ ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/75"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

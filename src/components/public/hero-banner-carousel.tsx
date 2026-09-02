"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const goTo = (i: number) => setActive((i + banners.length) % banners.length);

  return (
    <section className="relative">
      <div className="relative mx-auto aspect-[1390/750] w-full max-w-[1390px] overflow-hidden rounded-[var(--radius-lg)] bg-surface">
        {banners.map((banner, i) => {
          const content = (
            <div className="relative h-full w-full">
              <Image
                src={uploadUrl(banner.image)}
                alt={banner.title ?? ""}
                fill
                sizes="100vw"
                className="object-contain"
                priority={i === 0}
              />
              {banner.title && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />
                  <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                    <p className="max-w-3xl text-xl leading-snug font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-3xl lg:text-4xl">
                      {banner.title}
                    </p>
                  </div>
                </>
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
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="ก่อนหน้า"
              className="absolute top-1/2 left-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:left-5 sm:h-12 sm:w-12"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="ถัดไป"
              className="absolute top-1/2 right-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:right-5 sm:h-12 sm:w-12"
            >
              <ChevronRight size={22} />
            </button>

            <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
              <div className="flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm">
                {banners.map((banner, i) => (
                  <button
                    key={banner.id}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`สไลด์ที่ ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/75"}`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

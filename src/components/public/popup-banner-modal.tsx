"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { uploadUrl } from "@/lib/upload";

export type PopupBanner = { id: number; title: string | null; image: string; link_url: string | null };

/** Shows up to 3 active popup banners (see the layout's query) as a single
 * dialog with a slide carousel — auto-advancing with dots/arrows, mirroring
 * HeroBannerCarousel's controls — rather than one modal per banner. */
export function PopupBannerModal({ banners }: { banners: PopupBanner[] }) {
  const [open, setOpen] = useState(banners.length > 0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open || banners.length <= 1) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [open, banners.length]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (banners.length === 0 || !open) return null;

  const close = () => setOpen(false);
  const goTo = (i: number) => setActive((i + banners.length) % banners.length);
  const banner = banners[active];

  // No `fill`/object-cover here on purpose: with width+height left to "auto"
  // the browser sizes the image by its own real aspect ratio, so the frame
  // always matches the uploaded picture exactly — full image, no cropping,
  // no leftover letterbox background — only clamped so it can't exceed the
  // screen (max-height) or the 1700px cap (max-width).
  const image = (
    <Image
      src={uploadUrl(banner.image)}
      alt={banner.title ?? ""}
      width={1920}
      height={1080}
      sizes="(max-width: 1700px) 100vw, 1700px"
      className="block h-auto max-h-[80vh] w-auto max-w-[calc(100vw-2rem)] sm:max-w-[1700px]"
      priority
    />
  );

  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/70 p-4" onClick={close}>
      <div className="relative w-fit max-w-[1700px] overflow-hidden rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-lg)]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={close}
          aria-label="ปิด"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-900 shadow-lg ring-1 ring-black/10 transition-transform hover:scale-105 active:scale-95"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="relative">
          {banner.link_url ? (
            <Link href={banner.link_url} onClick={close}>
              {image}
            </Link>
          ) : (
            image
          )}

          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(active - 1)}
                aria-label="ก่อนหน้า"
                className="absolute top-1/2 left-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => goTo(active + 1)}
                aria-label="ถัดไป"
                className="absolute top-1/2 right-3 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
              >
                <ChevronRight size={20} />
              </button>

              <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
                <div className="flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm">
                  {banners.map((b, i) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`ป๊อปอัพที่ ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/75"}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {banner.title && <p className="px-4 py-3 text-center text-sm font-semibold text-text">{banner.title}</p>}
      </div>
    </div>
  );
}

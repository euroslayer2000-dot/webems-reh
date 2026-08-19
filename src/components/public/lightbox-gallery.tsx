"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.5;

function clampScale(scale: number) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function LightboxGallery({ images }: { images: { id: number; src: string; caption: string | null }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });

  const resetZoom = () => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  };

  const close = () => {
    setOpenIndex(null);
    resetZoom();
  };
  const prev = () => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    resetZoom();
  };
  const next = () => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
    resetZoom();
  };
  const goTo = (i: number) => {
    setOpenIndex(i);
    resetZoom();
  };

  const zoomIn = () => setScale((s) => clampScale(s + ZOOM_STEP));
  const zoomOut = () =>
    setScale((s) => {
      const n = clampScale(s - ZOOM_STEP);
      if (n === 1) setPos({ x: 0, y: 0 });
      return n;
    });

  const handleWheel = (e: React.WheelEvent) => {
    setScale((s) => {
      const n = clampScale(s + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
      if (n === 1) setPos({ x: 0, y: 0 });
      return n;
    });
  };

  const handleDoubleClick = () => {
    if (scale > 1) resetZoom();
    else setScale(2);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    dragging.current = true;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = pos;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setPos({
      x: posStart.current.x + (e.clientX - dragStart.current.x),
      y: posStart.current.y + (e.clientY - dragStart.current.y),
    });
  };

  const handlePointerUp = () => {
    dragging.current = false;
    setIsDragging(false);
  };

  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft" && images.length > 1) prev();
      if (e.key === "ArrowRight" && images.length > 1) next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => goTo(i)}
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
        <div className="fixed inset-0 z-[1050] flex flex-col items-center justify-center bg-black/90 p-4" onClick={close}>
          <button
            type="button"
            onClick={close}
            aria-label="ปิด"
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-900 shadow-lg ring-1 ring-black/10 transition-all hover:scale-105 hover:bg-gray-100 active:scale-95 sm:right-6 sm:top-6"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="ก่อนหน้า"
              className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div
            className="relative h-[70vh] w-full max-w-4xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onDoubleClick={handleDoubleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
          >
            <div
              className="relative h-full w-full transition-transform duration-150 ease-out"
              style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
            >
              <Image
                src={images[openIndex].src}
                alt={images[openIndex].caption ?? ""}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-contain"
                draggable={false}
              />
            </div>
          </div>

          {images[openIndex].caption && (
            <p className="mt-3 max-w-xl text-center text-sm text-white/85">{images[openIndex].caption}</p>
          )}

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="ถัดไป"
              className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
            >
              <ChevronRight size={22} />
            </button>
          )}

          <div
            className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 p-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              aria-label="ซูมออก"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Minus size={18} />
            </button>
            <span className="min-w-[3.5rem] text-center text-sm font-medium text-white">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
              aria-label="ซูมเข้า"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Plus size={18} />
            </button>
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center px-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex max-w-full gap-2 overflow-x-auto rounded-xl bg-white/10 p-2">
                {images.map((image, i) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`รูปที่ ${i + 1}`}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-2 transition-all ${
                      i === openIndex ? "opacity-100 ring-white" : "opacity-60 ring-transparent hover:opacity-90"
                    }`}
                  >
                    <Image src={image.src} alt="" fill sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

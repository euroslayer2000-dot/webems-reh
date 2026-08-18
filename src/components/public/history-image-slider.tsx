"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const IMAGES = [
  { src: "/assets/img/reh1.jpg", alt: "ประวัติความเป็นมา 1" },
  { src: "/assets/img/reh2.jpg", alt: "ประวัติความเป็นมา 2" },
  { src: "/assets/img/reh3.jpg", alt: "ประวัติความเป็นมา 3" },
  { src: "/assets/img/reh4.jpg", alt: "ประวัติความเป็นมา 4" },
  { src: "/assets/img/reh5.jpg", alt: "ประวัติความเป็นมา 5" },
];

const DELAY_MS = 10000;

export function HistoryImageSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((i) => (i + 1) % IMAGES.length), DELAY_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto mb-10 w-full max-w-2xl">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-[var(--shadow-sm)]">
        {IMAGES.map((image, i) => (
          <div
            key={image.src}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? "auto" : "none" }}
            aria-hidden={i !== active}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {IMAGES.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {IMAGES.map((image, i) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`รูปที่ ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === active ? "w-6 bg-primary-500" : "w-2 bg-border hover:bg-primary-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

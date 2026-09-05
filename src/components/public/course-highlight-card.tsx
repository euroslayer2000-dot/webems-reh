import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";

export function CourseHighlightCard({
  title,
  imageUrl,
  href,
  ctaLabel,
}: {
  title: string;
  imageUrl: string | null;
  href: string;
  ctaLabel: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] transition-transform hover:-translate-y-1"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[image:var(--grad-hero)]" />
          <GraduationCap size={96} className="absolute -right-3 -bottom-3 text-white/15" />
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/60" />

      <div className="relative flex h-full flex-col justify-between p-5">
        <h3 className="text-lg leading-snug font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">{title}</h3>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-white px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-white group-hover:text-text">
          {ctaLabel} <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}

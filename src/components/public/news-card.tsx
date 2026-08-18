import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye } from "lucide-react";
import { formatDateTh, strExcerpt } from "@/lib/format";
import { uploadUrl } from "@/lib/upload";

export type NewsCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  published_at: Date | null;
  views?: number;
  category: { name: string } | null;
};

export function NewsCard({ news }: { news: NewsCardData }) {
  return (
    <Link
      href={`/news/detail/${news.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1.5 hover:shadow-[var(--shadow-md)]"
    >
      <span className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-[image:var(--grad-accent)] transition-transform group-hover:scale-x-100" />

      <div className="relative aspect-[16/10] overflow-hidden bg-bg-soft">
        {news.category && (
          <span className="absolute left-3.5 top-3.5 z-[2] rounded-full bg-[image:var(--grad-accent)] px-2.5 py-1 text-[0.72rem] font-semibold text-white shadow-[0_4px_12px_rgba(255,107,157,0.35)]">
            {news.category.name}
          </span>
        )}
        <Image
          src={uploadUrl(news.cover_image)}
          alt={news.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex gap-4 text-[0.8rem] text-text-muted">
          <span className="flex items-center gap-1"><Calendar size={13} />{formatDateTh(news.published_at)}</span>
          {news.views !== undefined && (
            <span className="flex items-center gap-1"><Eye size={13} />{news.views.toLocaleString("th-TH")}</span>
          )}
        </div>
        <h3 className="mb-2 line-clamp-2 text-[1.08rem] leading-snug font-bold text-text group-hover:text-primary-500">
          {news.title}
        </h3>
        <p className="line-clamp-2 text-sm text-text-muted">{news.excerpt || strExcerpt(news.content, 100)}</p>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted ${
          page === 1 ? "pointer-events-none opacity-40" : "hover:border-primary-500 hover:text-primary-600"
        }`}
      >
        <ChevronLeft size={16} />
      </Link>

      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-text-muted">…</span>}
          <Link
            href={buildHref(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
              p === page ? "bg-primary-500 text-white" : "text-text hover:bg-bg-soft"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}

      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted ${
          page === totalPages ? "pointer-events-none opacity-40" : "hover:border-primary-500 hover:text-primary-600"
        }`}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}

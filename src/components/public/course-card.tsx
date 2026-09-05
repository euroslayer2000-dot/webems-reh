import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { uploadUrl } from "@/lib/upload";

export type CourseCardData = {
  slug: string;
  title: string;
  short_description: string | null;
  cover_image: string | null;
};

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)] transition-all hover:-translate-y-1.5 hover:shadow-[var(--shadow-md)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bg-soft">
        <Image
          src={uploadUrl(course.cover_image)}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-2 text-[1.08rem] leading-snug font-bold text-text group-hover:text-primary-500">
          {course.title}
        </h3>
        {course.short_description && (
          <p className="line-clamp-2 text-sm text-text-muted">{course.short_description}</p>
        )}
        <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-primary-600">
          ดูรายละเอียด <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

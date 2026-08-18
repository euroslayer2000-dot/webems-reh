import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Images } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";
import { uploadUrl } from "@/lib/upload";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "แกลเลอรีภาพกิจกรรม",
};

export default async function GalleryIndexPage() {
  const galleries = await prisma.gallery.findMany({
    include: { _count: { select: { images: true } } },
    orderBy: { id: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHero title="แกลเลอรีภาพกิจกรรม" subtitle="ภาพบรรยากาศการทำงานและกิจกรรมต่าง ๆ ของหน่วยกู้ชีพ" />

      <Container className="py-12">
        {galleries.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-muted">ยังไม่มีอัลบั้มภาพ</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {galleries.map((gallery) => (
              <Link
                key={gallery.id}
                href={`/gallery/album/${gallery.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square bg-bg-soft">
                  <Image
                    src={uploadUrl(gallery.cover_image)}
                    alt={gallery.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-bold text-text">{gallery.title}</h3>
                  <span className="mt-1 flex items-center gap-1 text-xs text-text-muted">
                    <Images size={12} /> {gallery._count.images} ภาพ
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";
import { LightboxGallery } from "@/components/public/lightbox-gallery";
import { uploadUrl } from "@/lib/upload";

export const revalidate = 60;

async function getGallery(slug: string) {
  const gallery = await prisma.gallery.findUnique({ where: { slug } });
  if (!gallery) return null;
  const images = await prisma.galleryImage.findMany({
    where: { gallery_id: gallery.id },
    orderBy: { sort_order: "asc" },
  });
  return { gallery, images };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getGallery(decodeURIComponent(slug));
  return data ? { title: data.gallery.title, description: data.gallery.description ?? undefined } : {};
}

export default async function GalleryAlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getGallery(decodeURIComponent(slug));
  if (!data) notFound();

  const { gallery, images } = data;

  return (
    <div>
      <PageHero title={gallery.title} subtitle={gallery.description ?? undefined} />

      <Container className="py-12">
        {images.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-muted">ยังไม่มีภาพในอัลบั้มนี้</p>
        ) : (
          <LightboxGallery
            images={images.map((img) => ({ id: img.id, src: uploadUrl(img.image_path), caption: img.caption }))}
          />
        )}

        <Link href="/gallery" className="mt-10 inline-block text-sm font-semibold text-primary-600 hover:underline">
          ← กลับไปหน้าแกลเลอรีทั้งหมด
        </Link>
      </Container>
    </div>
  );
}

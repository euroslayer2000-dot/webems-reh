import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";
import { uploadUrl } from "@/lib/upload";

export const revalidate = 60;

async function getCourse(slug: string) {
  return prisma.course.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(decodeURIComponent(slug));
  return course ? { title: course.title, description: course.short_description ?? undefined } : {};
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(decodeURIComponent(slug));
  if (!course || !course.is_active) notFound();

  return (
    <div>
      <PageHero title={course.title} subtitle={course.short_description ?? undefined} />

      <Container className="py-12">
        <div className="grid items-start gap-8 md:grid-cols-2">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-lg)] bg-bg-soft shadow-[var(--shadow-md)]">
            <Image src={uploadUrl(course.cover_image)} alt={course.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border p-6">
            <h2 className="text-lg font-bold text-text">{course.title}</h2>
            {course.short_description && <p className="mt-2 text-text-muted">{course.short_description}</p>}
            {course.content && (
              <p className="mt-4 whitespace-pre-wrap leading-relaxed text-text">{course.content}</p>
            )}
          </div>
        </div>

        <Link href="/courses" className="mt-10 inline-block text-sm font-semibold text-primary-600 hover:underline">
          ← กลับไปหน้าหลักสูตรทั้งหมด
        </Link>
      </Container>
    </div>
  );
}

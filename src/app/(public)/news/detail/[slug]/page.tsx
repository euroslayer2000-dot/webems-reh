import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { Calendar, Eye, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { NewsCard } from "@/components/public/news-card";
import { formatDateTh, strExcerpt } from "@/lib/format";
import { uploadUrl } from "@/lib/upload";

async function getArticle(slug: string) {
  return prisma.news.findFirst({
    where: { slug, status: "published" },
    include: { category: true, author: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(decodeURIComponent(slug));
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt || strExcerpt(article.content, 160),
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(decodeURIComponent(slug));
  if (!article) notFound();

  after(() => prisma.news.update({ where: { id: article.id }, data: { views: { increment: 1 } } }));

  const related = await prisma.news.findMany({
    where: { status: "published", id: { not: article.id } },
    orderBy: { published_at: "desc" },
    take: 3,
  });

  return (
    <article>
      <div className="bg-bg-soft pb-8 pt-10">
        <Container>
          {article.category && (
            <span className="mb-3 inline-block rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
              {article.category.name}
            </span>
          )}
          <h1 className="max-w-3xl text-2xl font-bold text-text sm:text-3xl">{article.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} /> {formatDateTh(article.published_at)}
            </span>
            {article.author && (
              <span className="flex items-center gap-1.5">
                <User size={14} /> {article.author.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Eye size={14} /> {article.views.toLocaleString("th-TH")} ครั้ง
            </span>
          </div>
        </Container>
        <div className="mx-auto mt-6 w-full max-w-[1650px] px-4">
          <Image
            src={uploadUrl(article.cover_image)}
            alt={article.title}
            width={0}
            height={0}
            sizes="(min-width: 1700px) 1650px, 100vw"
            priority
            className="h-auto w-full rounded-2xl"
          />
        </div>
      </div>

      <Container className="py-12">
        <div
          className="prose prose-sm sm:prose-base max-w-3xl prose-headings:text-text prose-p:text-text prose-a:text-primary-600"
          dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
        />

        {related.length > 0 && (
          <div className="mt-16 border-t border-border pt-10">
            <h2 className="mb-6 text-lg font-bold text-text">ข่าวที่เกี่ยวข้อง</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {related.map((item) => (
                <NewsCard key={item.slug} news={{ ...item, category: null }} />
              ))}
            </div>
          </div>
        )}

        <Link href="/news" className="mt-10 inline-block text-sm font-semibold text-primary-600 hover:underline">
          ← กลับไปหน้าข่าวสารทั้งหมด
        </Link>
      </Container>
    </article>
  );
}

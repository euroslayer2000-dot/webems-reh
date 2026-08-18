import type { Metadata } from "next";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/public/container";
import { PageHero } from "@/components/public/page-hero";
import { NewsCard } from "@/components/public/news-card";
import { Pagination } from "@/components/public/pagination";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ข่าวสารและประชาสัมพันธ์",
  description: "รวมข่าวประชาสัมพันธ์ กิจกรรม และประกาศจากหน่วยกู้ชีพ REH101",
};

const PER_PAGE = 9;

export default async function NewsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; cat?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.s?.trim() ?? "";
  const categoryId = params.cat ? Number(params.cat) : null;
  const page = Math.max(1, Number(params.page) || 1);

  const where = {
    status: "published" as const,
    ...(search !== ""
      ? { OR: [{ title: { contains: search } }, { content: { contains: search } }] }
      : {}),
    ...(categoryId ? { category_id: categoryId } : {}),
  };

  const [categories, total, news] = await Promise.all([
    prisma.category.findMany({ where: { type: "news" }, orderBy: { name: "asc" } }),
    prisma.news.count({ where }),
    prisma.news.findMany({
      where,
      include: { category: true },
      orderBy: { published_at: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const buildHref = (targetPage: number) => {
    const qs = new URLSearchParams();
    if (search) qs.set("s", search);
    if (categoryId) qs.set("cat", String(categoryId));
    if (targetPage > 1) qs.set("page", String(targetPage));
    const query = qs.toString();
    return query ? `/news?${query}` : "/news";
  };

  return (
    <div>
      <PageHero title="ข่าวสารและประชาสัมพันธ์" subtitle="รวมข่าวสาร กิจกรรม และประกาศจากหน่วยกู้ชีพ REH101" />

      <Container className="py-12">
        <form method="GET" className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              name="s"
              defaultValue={search}
              placeholder="ค้นหาข่าวสาร..."
              className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          {categoryId && <input type="hidden" name="cat" value={categoryId} />}
          <button
            type="submit"
            className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"
          >
            ค้นหา
          </button>
        </form>

        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <a
              href="/news"
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
                !categoryId ? "bg-primary-500 text-white" : "border border-border text-text-muted hover:bg-bg-soft"
              }`}
            >
              ทั้งหมด
            </a>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`/news?cat=${cat.id}`}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
                  categoryId === cat.id
                    ? "bg-primary-500 text-white"
                    : "border border-border text-text-muted hover:bg-bg-soft"
                }`}
              >
                {cat.name}
              </a>
            ))}
          </div>
        )}

        {news.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.slug} news={item} />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-text-muted">ไม่พบข่าวสารที่ค้นหา</p>
        )}

        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </Container>
    </div>
  );
}
